import { MAX_FILES, STREAM_ERROR_MARKER, STREAM_META_MARKER } from "@/lib/chat-protocol";
import type { AnswerVerification, ChatDocument, ChatRequestBody } from "@/lib/types";
import { uid } from "@/lib/utils";

export class ChatRequestError extends Error {}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // corps non JSON
  }
  if (res.status === 413) return "Fichier trop volumineux pour le serveur.";
  return `Erreur serveur (${res.status}).`;
}

export async function streamChat(
  body: ChatRequestBody,
  options: { signal: AbortSignal; onText: (fullText: string) => void },
): Promise<{ text: string; verification: AnswerVerification | null }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options.signal,
  });
  if (!res.ok || !res.body) {
    throw new ChatRequestError(await readError(res));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  const visible = () => {
    const meta = raw.indexOf(STREAM_META_MARKER);
    return meta === -1 ? raw : raw.slice(0, meta);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
    const markerIndex = raw.indexOf(STREAM_ERROR_MARKER);
    if (markerIndex !== -1) {
      options.onText(raw.slice(0, markerIndex));
      throw new ChatRequestError(raw.slice(markerIndex + STREAM_ERROR_MARKER.length));
    }
    // Ne pas afficher un marqueur en cours de réception.
    const text = visible();
    options.onText(text.endsWith("\u0000") ? text.slice(0, -1) : text);
  }
  raw += decoder.decode();

  const metaIndex = raw.indexOf(STREAM_META_MARKER);
  const text = metaIndex === -1 ? raw : raw.slice(0, metaIndex);
  let verification: AnswerVerification | null = null;
  if (metaIndex !== -1) {
    try {
      verification = JSON.parse(raw.slice(metaIndex + STREAM_META_MARKER.length)) as AnswerVerification;
    } catch {
      verification = null;
    }
  }
  options.onText(text);
  return { text, verification };
}

interface ExtractResponse {
  files?: {
    name: string;
    text: string;
    pageTexts: string[];
    pages: number | null;
    size: number;
  }[];
  error?: string;
}

/** Envoie les fichiers un par un pour rester sous la limite de taille des requêtes. */
export async function extractDocuments(
  files: File[],
  alreadyAttached: number,
): Promise<{ documents: ChatDocument[]; errors: string[] }> {
  const documents: ChatDocument[] = [];
  const errors: string[] = [];
  const room = Math.max(0, MAX_FILES - alreadyAttached);
  if (files.length > room) {
    errors.push(`${MAX_FILES} fichiers maximum par conversation.`);
  }
  for (const file of files.slice(0, room)) {
    const form = new FormData();
    form.append("files", file);
    try {
      const res = await fetch("/api/extract", { method: "POST", body: form });
      if (!res.ok) {
        errors.push(
          res.status === 413
            ? `${file.name} est trop volumineux pour l'hébergement de démo.`
            : await readError(res),
        );
        continue;
      }
      const data = (await res.json()) as ExtractResponse;
      for (const f of data.files ?? []) {
        documents.push({
          id: uid("d"),
          name: f.name,
          text: f.text,
          pageTexts: f.pageTexts,
          pages: f.pages,
          size: f.size,
        });
      }
    } catch {
      errors.push(`Échec de l'envoi de ${file.name}.`);
    }
  }
  return { documents, errors };
}
