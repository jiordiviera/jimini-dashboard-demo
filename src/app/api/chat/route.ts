import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  MessageStreamEvent,
} from "@anthropic-ai/sdk/resources/messages";
import { analyzeAnswer } from "@/lib/citations";
import {
  citationInstructions,
  RAPIDE_INSTRUCTIONS,
  REFLEXION_INSTRUCTIONS,
  SOURCES_INSTRUCTIONS,
  SYSTEM_PROMPT,
} from "@/lib/prompts";
import { STREAM_ERROR_MARKER, STREAM_META_MARKER } from "@/lib/chat-protocol";
import type { ChatRequestBody } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CONTEXT_MESSAGES = 20;
const MAX_DOC_CHARS = 150_000;

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function parseBody(raw: unknown): ChatRequestBody | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.messages)) return null;
  const messages = body.messages
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        typeof m === "object" &&
        ((m as { role?: unknown }).role === "user" ||
          (m as { role?: unknown }).role === "assistant") &&
        typeof (m as { content?: unknown }).content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content }));
  const documents = Array.isArray(body.documents)
    ? body.documents
        .filter(
          (d): d is { name: string; pageTexts: string[] } =>
            !!d &&
            typeof d === "object" &&
            typeof (d as { name?: unknown }).name === "string" &&
            Array.isArray((d as { pageTexts?: unknown }).pageTexts) &&
            (d as { pageTexts: unknown[] }).pageTexts.every((p) => typeof p === "string"),
        )
        .slice(0, 5)
    : [];
  return {
    messages,
    mode: body.mode === "reflexion" ? "reflexion" : "rapide",
    sources: body.sources === true,
    documents,
  };
}

function escapeAttr(value: string): string {
  return value.replace(/[&"<>]/g, (c) =>
    c === "&" ? "&amp;" : c === '"' ? "&quot;" : c === "<" ? "&lt;" : "&gt;",
  );
}

function buildMessages(body: ChatRequestBody): MessageParam[] {
  let messages = body.messages
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_CONTEXT_MESSAGES);
  while (messages.length > 0 && messages[0].role !== "user") {
    messages = messages.slice(1);
  }

  // Fusionne les messages consécutifs du même rôle (l'API exige l'alternance).
  const merged: MessageParam[] = [];
  for (const m of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role && typeof last.content === "string") {
      last.content = `${last.content}\n\n${m.content}`;
    } else {
      merged.push({ role: m.role, content: m.content });
    }
  }

  const lastUser = merged[merged.length - 1];
  if (lastUser && lastUser.role === "user" && body.documents.length > 0) {
    let budget = MAX_DOC_CHARS * body.documents.length;
    const docs = body.documents
      .map((d, index) => {
        const pages = d.pageTexts
          .map((text, i) => {
            const slice = text.slice(0, Math.max(0, budget));
            budget -= slice.length;
            return `<page number="${i + 1}">\n${slice}\n</page>`;
          })
          .join("\n");
        return `<document index="${index + 1}" name="${escapeAttr(d.name)}" pages="${d.pageTexts.length}">\n${pages}\n</document>`;
      })
      .join("\n\n");
    lastUser.content = `Documents joints :\n\n${docs}\n\n---\n\n${String(lastUser.content)}`;
  }
  return merged;
}

function describeError(error: unknown): { message: string; status: number } {
  if (error instanceof Anthropic.APIError) {
    const status = error.status ?? 502;
    if (status === 401)
      return { message: "Clé API Anthropic invalide (401).", status };
    if (status === 404)
      return {
        message: "Modèle introuvable : vérifiez ANTHROPIC_MODEL.",
        status,
      };
    if (status === 429)
      return {
        message: "Limite de débit atteinte, réessayez dans un instant.",
        status,
      };
    if (status === 529 || status === 503)
      return { message: "L'API Anthropic est surchargée, réessayez.", status };
    return { message: `Erreur de l'API Anthropic (${status}).`, status };
  }
  return { message: "Erreur inattendue lors de la génération.", status: 500 };
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError(
      "ANTHROPIC_API_KEY est absente côté serveur. Ajoutez-la dans .env.local ou dans les variables d'environnement Vercel.",
      500,
    );
  }

  let body: ChatRequestBody | null;
  try {
    body = parseBody(await req.json());
  } catch {
    body = null;
  }
  if (!body) return jsonError("Requête invalide.", 400);

  const messages = buildMessages(body);
  if (messages.length === 0) return jsonError("Message vide.", 400);

  const reflexion = body.mode === "reflexion";
  const system = [
    SYSTEM_PROMPT,
    reflexion ? REFLEXION_INSTRUCTIONS : RAPIDE_INSTRUCTIONS,
    body.documents.length > 0 ? citationInstructions(body.documents.length) : "",
    body.sources ? SOURCES_INSTRUCTIONS : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream(
    {
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: reflexion ? 4000 : 1500,
      // Pas de réflexion interne : elle consommerait le budget de tokens
      // avant la réponse ; le mode Réflexion passe par les consignes système.
      thinking: { type: "between_tools" },
      system,
      messages,
    },
    { signal: req.signal },
  );

  const iterator = stream[Symbol.asyncIterator]();
  let first: IteratorResult<MessageStreamEvent>;
  try {
    // On attend le premier événement pour renvoyer une vraie erreur HTTP
    // (clé invalide, modèle inconnu…) avant de commencer le flux.
    first = await iterator.next();
  } catch (error) {
    const { message, status } = describeError(error);
    return jsonError(message, status);
  }

  const encoder = new TextEncoder();
  const documents = body.documents;
  let fullText = "";
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (event: MessageStreamEvent) => {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          fullText += event.delta.text;
          controller.enqueue(encoder.encode(event.delta.text));
        }
      };
      try {
        if (!first.done) push(first.value);
        while (true) {
          const next = await iterator.next();
          if (next.done) break;
          push(next.value);
        }
        // Vérification côté serveur : chaque extrait cité existe-t-il vraiment
        // à la page indiquée ? Quelles références légales sont citées ?
        const verification = analyzeAnswer(fullText, documents);
        controller.enqueue(encoder.encode(`${STREAM_META_MARKER}${JSON.stringify(verification)}`));
        controller.close();
      } catch (error) {
        if (req.signal.aborted) {
          controller.close();
          return;
        }
        const { message } = describeError(error);
        controller.enqueue(encoder.encode(`${STREAM_ERROR_MARKER}${message}`));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
