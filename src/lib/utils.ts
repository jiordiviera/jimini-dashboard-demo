export { cn } from "cn";

export function uid(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

const DAY = 86_400_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatRelativeDay(ts: number, now = Date.now()): string {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ts);
}

export function titleFromText(text: string, max = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "Nouvelle conversation";
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
