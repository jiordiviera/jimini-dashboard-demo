import type { FeatureKey, View } from "@/lib/types";

const FEATURE_SLUGS: Record<FeatureKey, string> = {
  analysis: "grille-analyse",
  mailmerge: "publipostage",
  pdf: "edition-pdf",
  litigation: "contentieux",
  library: "bibliotheque",
};

const SLUG_TO_FEATURE = Object.fromEntries(
  Object.entries(FEATURE_SLUGS).map(([key, slug]) => [slug, key as FeatureKey]),
) as Record<string, FeatureKey>;

export function hashFromView(view: View): string {
  switch (view.name) {
    case "home":
      return "#/";
    case "chat":
      return `#/conversation/${view.id}`;
    case "folder":
      return `#/dossier/${view.id}`;
    case "folders":
      return "#/dossiers";
    case "history":
      return "#/historique";
    case "feature":
      return `#/${FEATURE_SLUGS[view.feature]}`;
  }
}

export function viewFromHash(hash: string): View {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [first, second] = parts;
  if (!first) return { name: "home" };
  if (first === "conversation" && second) return { name: "chat", id: decodeURIComponent(second) };
  if (first === "dossier" && second) return { name: "folder", id: decodeURIComponent(second) };
  if (first === "dossiers") return { name: "folders" };
  if (first === "historique") return { name: "history" };
  const feature = SLUG_TO_FEATURE[first];
  if (feature) return { name: "feature", feature };
  return { name: "home" };
}
