"use client";

import {
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { locateExcerpt } from "@/lib/citations";
import type { ChatDocument, CitationCheck } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DocumentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ChatDocument | null;
  citation: CitationCheck | null;
}

function PageText({
  text,
  range,
  scrollTo,
}: {
  text: string;
  range: [number, number] | null;
  scrollTo: boolean;
}) {
  const markRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!range || !scrollTo) return;
    const id = window.setTimeout(() => {
      markRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 250);
    return () => window.clearTimeout(id);
  }, [range, scrollTo]);

  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range[0])}
      <mark
        ref={markRef}
        className="rounded-[3px] bg-jm-star/35 px-0.5 text-jm-ink shadow-[0_0_0_2px_rgba(242,185,59,0.35)]"
      >
        {text.slice(range[0], range[1])}
      </mark>
      {text.slice(range[1])}
    </>
  );
}

export function DocumentPanel({ open, onOpenChange, document, citation }: DocumentPanelProps) {
  const pages = document
    ? document.pageTexts?.length
      ? document.pageTexts
      : [document.text]
    : [];
  const locations =
    citation && citation.status !== "not-found"
      ? (locateExcerpt(pages, citation.excerpt, citation.foundPage ?? citation.page) ?? [])
      : [];
  const rangeFor = (page: number) => locations.find((l) => l.page === page)?.range ?? null;
  const firstPage = locations[0]?.page ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[560px]">
        <div className="border-b border-jm-line px-5 pt-5 pb-4 pr-12">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-jm-rose-soft text-jm-rose">
              <DocumentTextIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate text-[15px] font-semibold text-jm-ink">
                {document?.name ?? "Document"}
              </SheetTitle>
              <SheetDescription className="text-[12.5px] text-jm-muted">
                {pages.length} page{pages.length > 1 ? "s" : ""} · texte extrait par Jimini
              </SheetDescription>
            </div>
          </div>
          {document?.url && (
            <a
              href={document.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-jm-blue hover:underline"
            >
              Ouvrir le PDF d&apos;origine <ArrowTopRightOnSquareIcon className="size-3.5" />
            </a>
          )}
          {citation && (
            <div
              className={cn(
                "mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12.5px] leading-snug",
                citation.status === "not-found"
                  ? "bg-jm-danger-soft text-jm-danger-ink"
                  : "bg-jm-teal-soft text-jm-teal-dark",
              )}
            >
              {citation.status === "not-found" ? (
                <ExclamationTriangleIcon className="mt-px size-4 shrink-0" />
              ) : (
                <CheckBadgeIcon className="mt-px size-4 shrink-0" />
              )}
              <span>
                {citation.status === "verified" &&
                  (locations.length > 1
                    ? `Extrait vérifié mot pour mot, à cheval sur les pages ${locations[0].page} et ${locations[1].page}.`
                    : `Extrait vérifié mot pour mot, page ${citation.page}.`)}
                {citation.status === "other-page" &&
                  `Extrait vérifié, mais page ${citation.foundPage} (le modèle indiquait la page ${citation.page}).`}
                {citation.status === "not-found" && (
                  <>
                    <strong>Extrait introuvable.</strong> « {citation.excerpt} » n&apos;apparaît pas
                    dans le document : la citation est à vérifier.
                  </>
                )}
              </span>
            </div>
          )}
        </div>
        <div className="jm-thin-scroll min-h-0 flex-1 overflow-y-auto bg-jm-page px-5 py-5">
          <div className="flex flex-col gap-4">
            {pages.map((text, index) => (
              <section
                key={index}
                aria-label={`Page ${index + 1}`}
                className={cn(
                  "rounded-xl border bg-white px-5 py-4",
                  rangeFor(index + 1) ? "border-jm-focus-border" : "border-jm-border",
                )}
              >
                <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-jm-subtle uppercase">
                  Page {index + 1}
                </p>
                <p className="font-serif text-[14px] leading-relaxed whitespace-pre-wrap text-jm-ink-2">
                  <PageText
                    text={text}
                    range={rangeFor(index + 1)}
                    scrollTo={firstPage === index + 1}
                  />
                </p>
              </section>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
