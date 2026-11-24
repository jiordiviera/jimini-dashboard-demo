"use client";

import {
  ArrowPathIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "sonner";
import { JiminiLoader } from "@/components/jimini-loader";
import { JiminiMark } from "@/components/jimini-mark";
import { Markdown } from "@/components/markdown";
import { VerificationFooter } from "@/components/verification-footer";
import type { AnswerVerification, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  streaming?: boolean;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  verification?: AnswerVerification | null;
  onOpenCitation?: (index: number) => void;
  onOpenAttachment?: (name: string) => void;
}

export function MessageBubble({
  message,
  streaming = false,
  canRegenerate = false,
  onRegenerate,
  verification = null,
  onOpenCitation,
  onOpenAttachment,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Impossible d'accéder au presse-papiers");
    }
  };

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-2">
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex max-w-[85%] flex-wrap justify-end gap-1.5">
            {message.attachments.map((a, i) => (
              <button
                type="button"
                key={`${a.name}-${i}`}
                onClick={() => onOpenAttachment?.(a.name)}
                className="inline-flex max-w-[240px] items-center gap-1.5 rounded-lg border border-jm-border bg-white px-2 py-1 text-[12px] text-jm-ink-3 transition-colors hover:border-jm-border-accent hover:text-jm-ink"
              >
                <DocumentTextIcon className="size-3.5 shrink-0 text-jm-rose" />
                <span className="truncate">{a.name}</span>
                {a.pages !== null && (
                  <span className="shrink-0 text-jm-faint">· {a.pages} p.</span>
                )}
              </button>
            ))}
          </div>
        )}
        <div className="max-w-[85%] rounded-[18px] rounded-br-md bg-jm-soft px-4 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap text-jm-ink sm:max-w-[75%]">
          {message.content}
        </div>
      </div>
    );
  }

  const empty = message.content.length === 0;

  return (
    <div data-assistant-message className="group flex scroll-mt-4 gap-3">
      <JiminiMark className="mt-0.5" />
      <div className="min-w-0 flex-1">
        {message.error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-jm-danger-border bg-jm-danger-soft px-4 py-3 text-[14px] text-jm-danger-ink">
            <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0" />
            <span>{message.content}</span>
          </div>
        ) : empty && streaming ? (
          <div className="flex h-8 items-center">
            <JiminiLoader label="Jimini analyse votre demande…" />
          </div>
        ) : (
          <div className={cn(streaming && "[&>div>*:last-child]:jm-caret")}>
            <Markdown
              content={message.content}
              citations={verification?.citations ?? null}
              onCitationClick={onOpenCitation}
            />
          </div>
        )}

        {!streaming && !message.error && verification && (
          <VerificationFooter verification={verification} />
        )}

        {!streaming && !empty && (
          <div className="mt-2 flex items-center gap-0.5 text-jm-muted opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            {!message.error && (
              <button
                type="button"
                onClick={() => void copy()}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[12.5px] transition-colors hover:bg-jm-hover hover:text-jm-ink"
              >
                {copied ? (
                  <CheckIcon className="size-4 text-jm-teal" />
                ) : (
                  <ClipboardDocumentIcon className="size-4" />
                )}
                {copied ? "Copié" : "Copier"}
              </button>
            )}
            {canRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[12.5px] transition-colors hover:bg-jm-hover hover:text-jm-ink"
              >
                <ArrowPathIcon className="size-4" /> Régénérer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
