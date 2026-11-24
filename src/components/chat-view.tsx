"use client";

import {
  ArrowLeftIcon,
  DocumentTextIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useChatRunner } from "@/components/chat-runner-provider";
import { Composer } from "@/components/composer";
import { DocumentPanel } from "@/components/document-panel";
import { ConversationMenu } from "@/components/conversation-menu";
import { FooterNote } from "@/components/footer-note";
import { MessageBubble } from "@/components/message-bubble";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyzeAnswer, citableDocuments } from "@/lib/citations";
import { moveConversation, useConversation, useFolders } from "@/lib/store";
import type { AnswerVerification, CitationCheck } from "@/lib/types";

interface ChatViewProps {
  conversationId: string;
  onBack: () => void;
}

const NO_FOLDER = "none";

export function ChatView({ conversationId, onBack }: ChatViewProps) {
  const conversation = useConversation(conversationId);
  const folders = useFolders();
  const { streaming, send, stop, regenerate } = useChatRunner();
  const [draft, setDraft] = useState("");
  const [panel, setPanel] = useState<{
    open: boolean;
    docIndex: number;
    citation: CitationCheck | null;
  }>({ open: false, docIndex: 0, citation: null });
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const isStreaming = streaming?.conversationId === conversationId;
  const documents = useMemo(
    () => citableDocuments(conversation?.documents ?? []),
    [conversation?.documents],
  );

  /** Vérification stockée (calculée côté serveur), ou recalculée pour les anciens messages. */
  const verifications = useMemo(() => {
    const map = new Map<string, AnswerVerification>();
    const docs = documents.map((d) => ({
      name: d.name,
      pageTexts: d.pageTexts?.length ? d.pageTexts : [d.text],
    }));
    for (const message of conversation?.messages ?? []) {
      if (message.role !== "assistant" || message.error || !message.content) continue;
      map.set(message.id, message.verification ?? analyzeAnswer(message.content, docs));
    }
    return map;
  }, [conversation?.messages, documents]);

  const openCitation = useCallback((citation: CitationCheck) => {
    setPanel({ open: true, docIndex: Math.max(0, citation.docIndex - 1), citation });
  }, []);

  const openDocument = useCallback(
    (name?: string) => {
      const index = name ? documents.findIndex((d) => d.name === name) : 0;
      setPanel({ open: true, docIndex: Math.max(0, index), citation: null });
    },
    [documents],
  );
  const lastMessage = conversation?.messages[conversation.messages.length - 1];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // À l'ouverture : on se place au début de la dernière réponse (plus lisible que la fin).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const answers = el.querySelectorAll<HTMLElement>("[data-assistant-message]");
    const last = answers[answers.length - 1];
    if (last) {
      el.scrollTop = Math.max(0, last.offsetTop - 24);
      stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    } else {
      el.scrollTop = el.scrollHeight;
      stickToBottom.current = true;
    }
  }, [conversationId]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [lastMessage?.content, conversation?.messages.length]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-serif text-[24px] text-jm-ink">Conversation introuvable</p>
        <p className="text-[14px] text-jm-muted">Elle a peut-être été supprimée.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 rounded-xl bg-jm-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-jm-blue-hover"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  const folderItems = [
    { value: NO_FOLDER, label: "Aucun dossier" },
    ...folders.map((f) => ({ value: f.id, label: f.name })),
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-jm-hover px-3 py-2.5 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-jm-ink-3 hover:bg-jm-hover hover:text-jm-ink"
        >
          <ArrowLeftIcon className="size-[18px]" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-jm-ink">
          {conversation.title}
        </h1>
        {conversation.documents.length > 0 && (
          <button
            type="button"
            onClick={() => openDocument()}
            className="hidden shrink-0 items-center gap-1 rounded-md bg-jm-chip px-2 py-1 text-[12px] font-medium text-jm-ink-3 transition-colors hover:bg-jm-soft hover:text-jm-blue sm:inline-flex"
          >
            <DocumentTextIcon className="size-3.5" />
            {conversation.documents.length} document
            {conversation.documents.length > 1 ? "s" : ""}
          </button>
        )}
        <Select
          items={folderItems}
          value={conversation.folderId ?? NO_FOLDER}
          onValueChange={(next) => {
            if (typeof next === "string") {
              moveConversation(conversation.id, next === NO_FOLDER ? null : next);
            }
          }}
        >
          <SelectTrigger
            aria-label="Dossier"
            className="h-8 max-w-[150px] shrink-0 gap-1 rounded-lg border-jm-border bg-white px-2 text-[12.5px] font-medium text-jm-ink-3 sm:max-w-[200px]"
          >
            <FolderIcon className="size-4 text-jm-folder" />
            <SelectValue className="truncate" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end" className="rounded-xl">
            {folderItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ConversationMenu conversation={conversation} onDeleted={onBack} />
      </header>

      <div ref={scrollRef} className="jm-thin-scroll relative min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[780px] flex-col gap-7 px-4 pt-8 pb-10 sm:px-6">
          {conversation.messages.map((message, index) => {
            const isLast = index === conversation.messages.length - 1;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                streaming={isStreaming && isLast && message.role === "assistant"}
                canRegenerate={!streaming && isLast && message.role === "assistant"}
                onRegenerate={() => regenerate(conversation.id)}
                verification={
                  isStreaming && isLast ? null : (verifications.get(message.id) ?? null)
                }
                onOpenCitation={(index) => {
                  const citation = verifications.get(message.id)?.citations[index];
                  if (citation) openCitation(citation);
                }}
                onOpenAttachment={openDocument}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-t from-jm-page via-jm-page to-jm-page/0 px-3 pt-2 pb-3 sm:px-6">
        <div className="mx-auto w-full max-w-[780px]">
          <Composer
            key={conversation.id}
            variant="compact"
            value={draft}
            onValueChange={setDraft}
            placeholder="Poursuivre la conversation…"
            streaming={isStreaming}
            onStop={stop}
            defaultMode={conversation.mode}
            defaultSources={conversation.sources}
            existingDocCount={conversation.documents.length}
            autoFocus
            onSubmit={(input) => {
              send(input, { conversationId: conversation.id });
              setDraft("");
              stickToBottom.current = true;
            }}
          />
          <FooterNote className="mt-2.5" />
        </div>
      </div>

      <DocumentPanel
        open={panel.open}
        onOpenChange={(open) => setPanel((prev) => ({ ...prev, open }))}
        document={documents[panel.docIndex] ?? null}
        citation={panel.citation}
      />
    </div>
  );
}
