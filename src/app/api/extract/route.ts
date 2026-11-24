import { extractText, getDocumentProxy } from "unpdf";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_BYTES,
  MAX_FILES,
} from "@/lib/chat-protocol";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEXT_CHARS = 150_000;

interface ExtractedFile {
  name: string;
  text: string;
  pageTexts: string[];
  pages: number | null;
  size: number;
  truncated: boolean;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function clean(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractFile(file: File): Promise<ExtractedFile> {
  const ext = extensionOf(file.name);
  const buffer = new Uint8Array(await file.arrayBuffer());
  let rawPages: string[];
  let pages: number | null = null;

  if (ext === ".pdf") {
    const pdf = await getDocumentProxy(buffer);
    const result = await extractText(pdf, { mergePages: false });
    rawPages = result.text;
    pages = result.totalPages;
  } else {
    rawPages = [new TextDecoder("utf-8").decode(buffer)];
  }

  // On garde le découpage par page (pour vérifier les citations « p.X »)
  // en plafonnant la taille totale.
  let budget = MAX_TEXT_CHARS;
  const pageTexts: string[] = [];
  let truncated = false;
  for (const page of rawPages.map(clean)) {
    if (budget <= 0) {
      truncated = true;
      break;
    }
    pageTexts.push(page.slice(0, budget));
    if (page.length > budget) truncated = true;
    budget -= page.length;
  }

  return {
    name: file.name,
    text: pageTexts.join("\n\n"),
    pageTexts,
    pages,
    size: file.size,
    truncated,
  };
}

export async function POST(req: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { error: "Envoi invalide ou fichier trop volumineux." },
      { status: 400 },
    );
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return Response.json(
      { error: `${MAX_FILES} fichiers maximum.` },
      { status: 400 },
    );
  }

  for (const file of files) {
    const ext = extensionOf(file.name);
    if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(ext)) {
      return Response.json(
        { error: `Format non pris en charge : ${file.name} (PDF, TXT, MD, CSV).` },
        { status: 415 },
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { error: `${file.name} dépasse 8 Mo.` },
        { status: 413 },
      );
    }
  }

  try {
    const extracted = await Promise.all(files.map(extractFile));
    const empty = extracted.find((f) => f.text.trim().length === 0);
    if (empty) {
      return Response.json(
        {
          error: `Aucun texte lisible dans ${empty.name} (PDF scanné ?).`,
        },
        { status: 422 },
      );
    }
    return Response.json({ files: extracted });
  } catch {
    return Response.json(
      { error: "Impossible de lire le fichier (PDF protégé ou corrompu ?)." },
      { status: 422 },
    );
  }
}
