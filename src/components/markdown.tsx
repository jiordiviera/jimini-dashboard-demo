"use client";

import { useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CitationPill } from "@/components/citation-pill";
import { linkCitations } from "@/lib/citations";
import type { CitationCheck } from "@/lib/types";
import { cn } from "@/lib/utils";

const baseComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 mb-2 font-serif text-[22px] font-medium text-jm-ink first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 font-serif text-[19px] font-medium text-jm-ink first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-[15px] font-semibold text-jm-ink first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-1 text-[14px] font-semibold text-jm-ink">{children}</h4>
  ),
  p: ({ children }) => <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-2.5 list-disc space-y-1 pl-5 marker:text-jm-marker">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2.5 list-decimal space-y-1 pl-5 marker:text-jm-muted">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-jm-ink">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-jm-blue underline underline-offset-2"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-jm-quote-border bg-jm-quote py-1.5 pr-3 pl-3.5 text-jm-ink-2 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-jm-border" />,
  code: ({ children, className }) => {
    const block = /language-/.test(className ?? "");
    return block ? (
      <code className={cn("font-mono text-[12.5px]", className)}>{children}</code>
    ) : (
      <code className="rounded-md bg-jm-chip px-1.5 py-0.5 font-mono text-[12.5px] text-jm-ink-2">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl bg-jm-table-head p-3.5 text-[12.5px] leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-jm-border">
      <table className="w-full border-collapse text-left text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-jm-table-head">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-jm-border px-3 py-2 font-semibold whitespace-nowrap text-jm-ink">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-jm-line px-3 py-2 align-top">{children}</td>
  ),
};

interface MarkdownProps {
  content: string;
  className?: string;
  /** Résultat de la vérification des citations, dans l'ordre d'apparition. */
  citations?: CitationCheck[] | null;
  onCitationClick?: (index: number) => void;
}

export function Markdown({ content, className, citations, onCitationClick }: MarkdownProps) {
  const components = useMemo<Components>(
    () => ({
      ...baseComponents,
      a: ({ children, href }) => {
        const match = href?.match(/^#jm-cite-(\d+)$/);
        if (match) {
          const index = Number(match[1]);
          return (
            <CitationPill
              citation={citations?.[index]}
              onOpen={() => onCitationClick?.(index)}
            />
          );
        }
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-jm-blue underline underline-offset-2"
          >
            {children}
          </a>
        );
      },
    }),
    [citations, onCitationClick],
  );

  const source = useMemo(() => linkCitations(content), [content]);

  return (
    <div className={cn("text-[14.5px] leading-[1.7] break-words text-jm-prose", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
