/** Marqueur ajouté au flux texte quand une erreur survient en cours de génération. */
export const STREAM_ERROR_MARKER = "\u0000__JIMINI_ERROR__:";

/** Marqueur suivi du JSON de vérification (citations, références), envoyé en fin de flux. */
export const STREAM_META_MARKER = "\u0000__JIMINI_META__:";

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md", ".csv"] as const;
export const ACCEPT_ATTR = ".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv";
