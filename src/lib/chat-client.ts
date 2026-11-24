import { MAX_FILES, STREAM_ERROR_MARKER } from "@/lib/chat-protocol";
import type { ChatDocument, ChatRequestBody } from "@/lib/types";
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
): Promise<string> {
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
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    const markerIndex = text.indexOf(STREAM_ERROR_MARKER);
    if (markerIndex !== -1) {
      const partial = text.slice(0, markerIndex);
      options.onText(partial);
      throw new ChatRequestError(
        text.slice(markerIndex + STREAM_ERROR_MARKER.length),
      );
    }
    options.onText(text);
  }
  text += decoder.decode();
  options.onText(text);
  return text;
}

interface ExtractResponse {
  files?: { name: string; text: string; pages: number | null; size: number }[];
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
        documents.push({ id: uid("d"), ...f });
      }
    } catch {
      errors.push(`Échec de l'envoi de ${file.name}.`);
    }
  }
  return { documents, errors };
}
