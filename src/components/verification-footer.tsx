"use client";

import {
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { summarize } from "@/lib/citations";
import type { AnswerVerification } from "@/lib/types";

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

export function VerificationFooter({ verification }: { verification: AnswerVerification }) {
  const summary = summarize(verification);
  if (verification.citations.length === 0 && verification.legalRefs.length === 0) return null;

  const parts: { text: string; tone: "ok" | "info" | "warn" }[] = [];
  if (verification.citations.length > 0) {
    parts.push({
      text: `${plural(summary.verified, "citation du document vérifiée", "citations du document vérifiées")}`,
      tone: "ok",
    });
  }
  if (summary.articles > 0) {
    parts.push({ text: plural(summary.articles, "article de loi", "articles de loi"), tone: "info" });
  }
  if (summary.toVerify > 0) {
    parts.push({ text: `${summary.toVerify} à vérifier`, tone: "warn" });
  }

  return (
    <div className="mt-4 rounded-xl border border-jm-border bg-white px-3.5 py-3">
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] font-medium">
        {parts.map((part, index) => (
          <span key={part.text} className="inline-flex items-center gap-1.5">
            {index > 0 && <span className="text-jm-faint">·</span>}
            <span
              className={
                part.tone === "ok"
                  ? "text-jm-teal-dark"
                  : part.tone === "warn"
                    ? "text-jm-orange"
                    : "text-jm-ink-3"
              }
            >
              {part.text}
            </span>
          </span>
        ))}
      </p>
      {verification.legalRefs.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {verification.legalRefs.map((ref) => (
            <Tooltip key={ref.key}>
              <TooltipTrigger
                render={
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-6 items-center gap-1 rounded-md border border-jm-border bg-jm-surface px-2 text-[11.5px] font-medium text-jm-ink-2 transition-colors hover:border-jm-border-accent hover:bg-jm-hover-soft"
                  />
                }
              >
                <ScaleIcon className="size-3.5 text-jm-muted" />
                {ref.label}
                {!ref.complete && (
                  <span className="ml-0.5 inline-flex items-center gap-0.5 rounded bg-jm-orange-soft px-1 text-[10.5px] font-semibold text-jm-orange">
                    <ExclamationTriangleIcon className="size-3" /> à vérifier
                  </span>
                )}
                <ArrowTopRightOnSquareIcon className="size-3 text-jm-faint" />
              </TooltipTrigger>
              <TooltipContent>
                {ref.complete
                  ? "Rechercher sur Légifrance"
                  : "Référence incomplète (code ou date manquant) : rechercher sur Légifrance"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
}
