"use client";

import {
  CheckBadgeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CitationCheck } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CitationPillProps {
  citation: CitationCheck | undefined;
  onOpen: () => void;
}

function truncate(text: string, max = 42): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function CitationPill({ citation, onOpen }: CitationPillProps) {
  if (!citation) {
    return (
      <span className="mx-0.5 inline-flex h-5 items-center gap-1 rounded-md bg-jm-chip px-1.5 align-[1px] text-[11.5px] font-medium text-jm-muted">
        <DocumentTextIcon className="size-3" /> source…
      </span>
    );
  }

  const notFound = citation.status === "not-found";
  const otherPage = citation.status === "other-page";
  const page = otherPage && citation.foundPage ? citation.foundPage : citation.page;

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onOpen}
        className={cn(
          "mx-0.5 inline-flex h-5 max-w-full cursor-pointer items-center gap-1 rounded-md border px-1.5 align-[1px] text-[11.5px] font-medium transition-colors",
          notFound
            ? "border-jm-danger-border bg-jm-danger-soft text-jm-danger-ink hover:bg-jm-rose-soft"
            : "border-jm-soft-hover bg-jm-soft text-jm-blue hover:border-jm-blue/40",
        )}
      >
        {notFound ? (
          <ExclamationTriangleIcon className="size-3 shrink-0" />
        ) : (
          <CheckBadgeIcon className="size-3.5 shrink-0" />
        )}
        <span className="shrink-0">p.{page}</span>
        <span className="hidden max-w-[220px] truncate font-normal opacity-80 sm:inline">
          « {truncate(citation.excerpt)} »
        </span>
        {notFound && <span className="shrink-0 font-semibold">· extrait introuvable</span>}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left">
        {notFound
          ? "Cet extrait n'existe pas dans le document : à vérifier."
          : otherPage
            ? `Extrait trouvé page ${citation.foundPage} (le modèle indiquait p.${citation.page}).`
            : "Extrait vérifié dans le document. Cliquez pour le voir en contexte."}
      </TooltipContent>
    </Tooltip>
  );
}
