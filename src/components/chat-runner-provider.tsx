"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { ChatRequestError, streamChat } from "@/lib/chat-client";
import {
  appendMessages,
  createConversation,
  getConversation,
  removeMessagesFrom,
  updateConversation,
  updateMessage,
} from "@/lib/store";
import type { ChatMessage, ComposerSubmit, ConversationKind } from "@/lib/types";
import { titleFromText, uid } from "@/lib/utils";

interface StreamingState {
  conversationId: string;
  messageId: string;
}

interface SendOptions {
  conversationId?: string | null;
  folderId?: string | null;
  kind?: ConversationKind;
}

interface ChatRunner {
  streaming: StreamingState | null;
  send: (input: ComposerSubmit, options?: SendOptions) => string;
  stop: () => void;
  regenerate: (conversationId: string) => void;
}

const ChatRunnerContext = createContext<ChatRunner | null>(null);

export function useChatRunner(): ChatRunner {
  const ctx = useContext(ChatRunnerContext);
  if (!ctx) throw new Error("useChatRunner doit être utilisé dans ChatRunnerProvider");
  return ctx;
}

const CONTEXT_WINDOW = 20;

export function ChatRunnerProvider({ children }: { children: ReactNode }) {
  const [streaming, setStreaming] = useState<StreamingState | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async (conversationId: string) => {
    const conversation = getConversation(conversationId);
    if (!conversation) return;

    const history = conversation.messages
      .filter((m) => !m.error && m.content.trim().length > 0)
      .slice(-CONTEXT_WINDOW)
      .map((m) => ({ role: m.role, content: m.content }));

    const assistant: ChatMessage = {
      id: uid("m"),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    appendMessages(conversationId, [assistant]);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStreaming({ conversationId, messageId: assistant.id });

    try {
      await streamChat(
        {
          messages: history,
          mode: conversation.mode,
          sources: conversation.sources,
          documents: conversation.documents
            .filter((d) => d.text.length > 0)
            .map((d) => ({ name: d.name, text: d.text })),
        },
        {
          signal: controller.signal,
          onText: (text) =>
            updateMessage(conversationId, assistant.id, { content: text }),
        },
      );
    } catch (error) {
      const current = getConversation(conversationId)?.messages.find(
        (m) => m.id === assistant.id,
      );
      if (controller.signal.aborted) {
        // Arrêt volontaire : on garde le texte reçu, ou on retire la bulle vide.
        if (!current?.content) removeMessagesFrom(conversationId, assistant.id);
      } else {
        const message =
          error instanceof ChatRequestError
            ? error.message
            : "Connexion interrompue. Vérifiez votre réseau.";
        toast.error(message);
        if (!current?.content) {
          updateMessage(conversationId, assistant.id, {
            content: message,
            error: true,
          });
        }
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setStreaming(null);
      }
      updateConversation(conversationId, { updatedAt: Date.now() });
    }
  }, []);

  const send = useCallback(
    (input: ComposerSubmit, options: SendOptions = {}) => {
      let conversationId = options.conversationId ?? null;
      const existing = conversationId ? getConversation(conversationId) : undefined;

      if (!existing) {
        const created = createConversation({
          title: titleFromText(input.text),
          mode: input.mode,
          sources: input.sources,
          documents: input.documents,
          folderId: options.folderId ?? null,
          kind: options.kind ?? (input.documents.length > 0 ? "analysis" : "chat"),
        });
        conversationId = created.id;
      } else {
        const known = new Set(existing.documents.map((d) => d.id));
        updateConversation(existing.id, {
          mode: input.mode,
          sources: input.sources,
          documents: [
            ...existing.documents,
            ...input.documents.filter((d) => !known.has(d.id)),
          ],
        });
        conversationId = existing.id;
      }

      const userMessage: ChatMessage = {
        id: uid("m"),
        role: "user",
        content: input.text,
        createdAt: Date.now(),
        attachments:
          input.documents.length > 0
            ? input.documents.map((d) => ({ name: d.name, pages: d.pages }))
            : undefined,
      };
      appendMessages(conversationId, [userMessage]);
      void run(conversationId);
      return conversationId;
    },
    [run],
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const regenerate = useCallback(
    (conversationId: string) => {
      const conversation = getConversation(conversationId);
      if (!conversation) return;
      const last = conversation.messages[conversation.messages.length - 1];
      if (last?.role === "assistant") {
        removeMessagesFrom(conversationId, last.id);
      }
      void run(conversationId);
    },
    [run],
  );

  const value = useMemo(
    () => ({ streaming, send, stop, regenerate }),
    [streaming, send, stop, regenerate],
  );

  return (
    <ChatRunnerContext.Provider value={value}>{children}</ChatRunnerContext.Provider>
  );
}
