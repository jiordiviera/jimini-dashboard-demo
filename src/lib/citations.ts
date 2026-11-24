import type {
  AnswerVerification,
  CitationCheck,
  LegalRef,
} from "@/lib/types";

/**
 * Citation d'un document joint, au format [doc:p.3 "extrait exact"]
 * (ou [doc2:p.3 "…"] quand plusieurs documents sont joints).
 */
export const CITATION_PATTERN =
  /\[doc(\d*)\s*:\s*p\.?\s*(\d+)\s*[,;]?\s*["“«]\s*([^\]]+?)\s*["”»]\s*\]/g;

export interface ParsedCitation {
  raw: string;
  docIndex: number;
  page: number;
  excerpt: string;
}

export function parseCitations(text: string): ParsedCitation[] {
  const result: ParsedCitation[] = [];
  for (const match of text.matchAll(CITATION_PATTERN)) {
    result.push({
      raw: match[0],
      docIndex: match[1] ? Number(match[1]) : 1,
      page: Number(match[2]),
      excerpt: match[3].trim(),
    });
  }
  return result;
}

/* ------------------------- Recherche d'extraits ------------------------- */

const CHAR_MAP: Record<string, string> = {
  "’": "'",
  "‘": "'",
  "`": "'",
  "´": "'",
  "“": '"',
  "”": '"',
  "«": '"',
  "»": '"',
  "‐": "-",
  "‑": "-",
  "–": "-",
  "—": "-",
  " ": " ",
  " ": " ",
};

/** Normalise un texte et garde, pour chaque caractère produit, sa position d'origine. */
function normalizeWithMap(input: string): { text: string; map: number[] } {
  let text = "";
  const map: number[] = [];
  let lastWasSpace = true;
  for (let i = 0; i < input.length; i++) {
    let ch = input[i].normalize("NFC");
    ch = CHAR_MAP[ch] ?? ch;
    if (/\s/.test(ch)) {
      if (lastWasSpace) continue;
      ch = " ";
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
    }
    for (const c of ch.toLowerCase()) {
      text += c;
      map.push(i);
    }
  }
  return { text, map };
}

function normalize(input: string): string {
  return normalizeWithMap(input).text.trim();
}

/** Découpe un extrait sur les ellipses : chaque fragment doit exister, dans l'ordre. */
function fragmentsOf(excerpt: string): string[] {
  return excerpt
    .split(/\s*(?:\.\.\.|…|\[\.\.\.\]|\(\.\.\.\))\s*/)
    .map((part) => normalize(part.replace(/^["'\s]+|["'\s]+$/g, "")))
    .filter((part) => part.length >= 3);
}

/** Position [début, fin[ de l'extrait dans le texte d'origine, ou null. */
export function findExcerpt(haystack: string, excerpt: string): [number, number] | null {
  const fragments = fragmentsOf(excerpt);
  if (fragments.length === 0) return null;
  const { text, map } = normalizeWithMap(haystack);
  let cursor = 0;
  let start = -1;
  let end = -1;
  for (const fragment of fragments) {
    const index = text.indexOf(fragment, cursor);
    if (index === -1) return null;
    if (start === -1) start = index;
    end = index + fragment.length;
    cursor = end;
  }
  return [map[start], map[end - 1] + 1];
}

export function verifyCitations(
  text: string,
  documents: { name: string; pageTexts: string[] }[],
): CitationCheck[] {
  return parseCitations(text).map((citation) => {
    const doc = documents[citation.docIndex - 1];
    const base = {
      docIndex: citation.docIndex,
      docName: doc?.name ?? null,
      page: citation.page,
      excerpt: citation.excerpt,
    };
    if (!doc) return { ...base, status: "not-found", foundPage: null };
    const stated = doc.pageTexts[citation.page - 1];
    if (stated !== undefined && findExcerpt(stated, citation.excerpt)) {
      return { ...base, status: "verified", foundPage: citation.page };
    }
    const other = doc.pageTexts.findIndex((page) => findExcerpt(page, citation.excerpt));
    if (other !== -1) return { ...base, status: "other-page", foundPage: other + 1 };
    return { ...base, status: "not-found", foundPage: null };
  });
}

/* -------------------------- Références légales -------------------------- */

const CODES: { pattern: RegExp; name: string }[] = [
  { pattern: /code\s+civil|c\.\s?civ\b\.?/i, name: "Code civil" },
  { pattern: /code\s+de\s+commerce|c\.\s?com\b\.?/i, name: "Code de commerce" },
  { pattern: /code\s+du\s+travail|c\.\s?trav\b\.?/i, name: "Code du travail" },
  {
    pattern: /code\s+des\s+procédures\s+civiles\s+d'exécution|\bcpce\b/i,
    name: "Code des procédures civiles d'exécution",
  },
  { pattern: /code\s+de\s+procédure\s+civile|\bcpc\b/i, name: "Code de procédure civile" },
  { pattern: /code\s+de\s+procédure\s+pénale|\bcpp\b/i, name: "Code de procédure pénale" },
  { pattern: /code\s+pénal|c\.\s?pén\b\.?/i, name: "Code pénal" },
  { pattern: /code\s+de\s+la\s+consommation|c\.\s?consom\b\.?/i, name: "Code de la consommation" },
  { pattern: /code\s+général\s+des\s+impôts|\bcgi\b/i, name: "Code général des impôts" },
  {
    pattern: /code\s+de\s+la\s+construction\s+et\s+de\s+l'habitation|\bcch\b/i,
    name: "Code de la construction et de l'habitation",
  },
  { pattern: /code\s+monétaire\s+et\s+financier/i, name: "Code monétaire et financier" },
  { pattern: /code\s+de\s+l'urbanisme/i, name: "Code de l'urbanisme" },
  {
    pattern: /code\s+de\s+la\s+propriété\s+intellectuelle|\bcpi\b/i,
    name: "Code de la propriété intellectuelle",
  },
  { pattern: /code\s+des\s+assurances/i, name: "Code des assurances" },
];

const ARTICLE_NUMBER = String.raw`(?:[LRDA]\.?\s?)?\d+(?:-\d+)*`;
const ARTICLE_PATTERN = new RegExp(
  String.raw`\b(?:articles?|art\.)\s+(${ARTICLE_NUMBER}(?:\s*(?:,|et|à|ou)\s*${ARTICLE_NUMBER})*)((?:(?!\b(?:articles?|art\.)\s)[^\n;]){0,70})`,
  "gi",
);
const LAW_PATTERN =
  /\bloi\s+(?:n°\s*(\d{2,4}-\d+))?\s*(?:du\s+(\d{1,2}(?:er)?\s+[a-zéû]+\s+\d{4}))?/gi;

/** Loi désignée par son nom usuel (« loi Pinel », « loi ELAN ») : référence incomplète. */
const NAMED_LAW_PATTERN = /\bloi\s+(?:dite\s+)?(?:«\s*)?([A-ZÉ][A-Za-zéèêëïô-]{2,})\b/g;

function legifranceUrl(query: string): string {
  return `https://www.legifrance.gouv.fr/search/all?tab_selection=all&searchField=ALL&query=${encodeURIComponent(query)}&page=1&init=true`;
}

function formatArticle(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .replace(/^([LRDA])\.?(\d)/i, (_, letter: string, digit: string) => `${letter.toUpperCase()}. ${digit}`);
}

export function detectLegalRefs(text: string): LegalRef[] {
  const source = text.replace(CITATION_PATTERN, " ");
  const refs = new Map<string, LegalRef>();

  for (const match of source.matchAll(ARTICLE_PATTERN)) {
    const numbers = match[1].split(/\s*(?:,|et|à|ou)\s*/).filter(Boolean);
    const context = match[2] ?? "";
    const code = CODES.find((c) => c.pattern.test(context))?.name ?? null;
    for (const number of numbers) {
      const article = formatArticle(number);
      // « article 3 » sans code ni préfixe L./R./D. : article du contrat, pas un texte de loi.
      const hasPrefix = /^[LRDA]\./i.test(article);
      const numeric = Number.parseInt(article.replace(/^[LRDA]\.\s?/i, ""), 10);
      if (!code && !hasPrefix && numeric < 100) continue;
      const key = `${code ?? "?"}|${article}`;
      if (refs.has(key)) continue;
      const label = code ? `Art. ${article} ${code}` : `Art. ${article}`;
      refs.set(key, {
        key,
        label,
        article,
        code,
        complete: code !== null,
        url: legifranceUrl(code ? `article ${article.replace(". ", "")} ${code}` : `article ${article}`),
      });
    }
  }

  for (const match of source.matchAll(LAW_PATTERN)) {
    const [, number, date] = match;
    if (!number && !date) continue;
    const label = `Loi${number ? ` n° ${number}` : ""}${date ? ` du ${date}` : ""}`;
    const key = `loi|${number ?? ""}|${date ?? ""}`;
    if (refs.has(key)) continue;
    refs.set(key, {
      key,
      label,
      article: null,
      code: null,
      complete: Boolean(number && date),
      url: legifranceUrl(label),
    });
  }

  for (const match of source.matchAll(NAMED_LAW_PATTERN)) {
    const label = `Loi ${match[1]}`;
    const key = `loi-nommee|${match[1].toLowerCase()}`;
    if (refs.has(key)) continue;
    refs.set(key, {
      key,
      label,
      article: null,
      code: null,
      complete: false,
      url: legifranceUrl(label),
    });
  }

  // « l'article 606 » seul fait double emploi avec « article 606 du Code civil ».
  const coded = new Set(
    [...refs.values()].filter((r) => r.code && r.article).map((r) => r.article),
  );
  return [...refs.values()].filter((r) => r.code || !r.article || !coded.has(r.article));
}

export function analyzeAnswer(
  text: string,
  documents: { name: string; pageTexts: string[] }[],
): AnswerVerification {
  return {
    citations: verifyCitations(text, documents),
    legalRefs: detectLegalRefs(text),
  };
}

export interface VerificationSummary {
  verified: number;
  notFound: number;
  articles: number;
  toVerify: number;
}

export function summarize(verification: AnswerVerification): VerificationSummary {
  const verified = verification.citations.filter((c) => c.status !== "not-found").length;
  const notFound = verification.citations.length - verified;
  const incomplete = verification.legalRefs.filter((r) => !r.complete).length;
  return {
    verified,
    notFound,
    articles: verification.legalRefs.length,
    toVerify: notFound + incomplete,
  };
}

/** Documents dans l'ordre où ils sont envoyés au modèle (index de citation = position + 1). */
export function citableDocuments<T extends { text: string }>(documents: T[]): T[] {
  return documents.filter((d) => d.text.length > 0);
}

/** Remplace chaque citation par un lien Markdown « #jm-cite-N » rendu en pastille. */
export function linkCitations(markdown: string): string {
  let index = 0;
  return markdown.replace(CITATION_PATTERN, () => `[cite](#jm-cite-${index++})`);
}
