"use client";

import { useSyncExternalStore } from "react";
import { createSeedState, STATE_VERSION } from "@/lib/seed";
import type {
  AppState,
  ChatMessage,
  Conversation,
  ConversationKind,
  Folder,
} from "@/lib/types";
import { uid } from "@/lib/utils";

const STORAGE_KEY = "jimini-demo-state";
const UI_KEY = "jimini-demo-ui";

type Listener = () => void;

const listeners = new Set<Listener>();
let state: AppState | null = null;
const serverState: AppState = createSeedState();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let freshlySeeded = false;

/** Vrai une seule fois si les données de départ viennent d'être créées (premier chargement). */
export function takeFreshSeed(): boolean {
  getState();
  const value = freshlySeeded;
  freshlySeeded = false;
  return value;
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<AppState>;
  return (
    v.version === STATE_VERSION &&
    Array.isArray(v.folders) &&
    Array.isArray(v.conversations)
  );
}

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isAppState(parsed)) return parsed;
    }
  } catch {
    // Stockage indisponible ou corrompu : on repart des données de départ.
  }
  const seeded = createSeedState();
  freshlySeeded = true;
  writeNow(seeded);
  return seeded;
}

function writeNow(next: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota dépassé : on retire le texte des documents joints et on réessaie.
    try {
      const light: AppState = {
        ...next,
        conversations: next.conversations.map((c) => ({
          ...c,
          documents: c.documents.map((d) => ({ ...d, text: "", pageTexts: [] })),
        })),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(light));
    } catch {
      // Abandon silencieux : l'état reste en mémoire.
    }
  }
}

function schedulePersist(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    if (state) writeNow(state);
  }, 400);
}

function getState(): AppState {
  if (state === null) state = load();
  return state;
}

function setState(updater: (prev: AppState) => AppState): void {
  state = updater(getState());
  schedulePersist();
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => serverState);
}

export function useFolders(): Folder[] {
  return useAppState().folders;
}

export function useConversations(): Conversation[] {
  return useAppState().conversations;
}

export function useConversation(id: string | null): Conversation | undefined {
  const conversations = useConversations();
  return id ? conversations.find((c) => c.id === id) : undefined;
}

export function getConversation(id: string): Conversation | undefined {
  return getState().conversations.find((c) => c.id === id);
}

/* ----------------------------- Dossiers ----------------------------- */

export function createFolder(name: string): Folder {
  const folder: Folder = {
    id: uid("f"),
    name: name.trim(),
    docCount: 0,
    starred: false,
    tone: "periwinkle",
    members: ["JK"],
    createdAt: Date.now(),
  };
  setState((s) => ({ ...s, folders: [...s.folders, folder] }));
  return folder;
}

export function renameFolder(id: string, name: string): void {
  setState((s) => ({
    ...s,
    folders: s.folders.map((f) =>
      f.id === id ? { ...f, name: name.trim() } : f,
    ),
  }));
}

export function toggleFolderStar(id: string): void {
  setState((s) => ({
    ...s,
    folders: s.folders.map((f) =>
      f.id === id ? { ...f, starred: !f.starred } : f,
    ),
  }));
}

export function deleteFolder(id: string): void {
  setState((s) => ({
    ...s,
    folders: s.folders.filter((f) => f.id !== id),
    conversations: s.conversations.map((c) =>
      c.folderId === id ? { ...c, folderId: null } : c,
    ),
  }));
}

/* --------------------------- Conversations -------------------------- */

export function createConversation(
  input: Pick<Conversation, "title" | "mode" | "sources" | "documents"> & {
    folderId?: string | null;
    kind?: ConversationKind;
  },
): Conversation {
  const now = Date.now();
  const conversation: Conversation = {
    id: uid("c"),
    title: input.title,
    kind: input.kind ?? "chat",
    folderId: input.folderId ?? null,
    messages: [],
    documents: input.documents,
    mode: input.mode,
    sources: input.sources,
    members: ["JK"],
    createdAt: now,
    updatedAt: now,
  };
  setState((s) => ({
    ...s,
    conversations: [conversation, ...s.conversations],
  }));
  return conversation;
}

export function updateConversation(
  id: string,
  patch: Partial<Omit<Conversation, "id">>,
): void {
  setState((s) => ({
    ...s,
    conversations: s.conversations.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    ),
  }));
}

export function renameConversation(id: string, title: string): void {
  updateConversation(id, { title: title.trim() || "Sans titre" });
}

export function moveConversation(id: string, folderId: string | null): void {
  updateConversation(id, { folderId });
}

export function deleteConversation(id: string): void {
  setState((s) => ({
    ...s,
    conversations: s.conversations.filter((c) => c.id !== id),
  }));
}

export function appendMessages(id: string, messages: ChatMessage[]): void {
  setState((s) => ({
    ...s,
    conversations: s.conversations.map((c) =>
      c.id === id
        ? { ...c, messages: [...c.messages, ...messages], updatedAt: Date.now() }
        : c,
    ),
  }));
}

export function updateMessage(
  conversationId: string,
  messageId: string,
  patch: Partial<Omit<ChatMessage, "id">>,
): void {
  setState((s) => ({
    ...s,
    conversations: s.conversations.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, ...patch } : m,
            ),
          }
        : c,
    ),
  }));
}

export function removeMessagesFrom(
  conversationId: string,
  messageId: string,
): void {
  setState((s) => ({
    ...s,
    conversations: s.conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const index = c.messages.findIndex((m) => m.id === messageId);
      return index === -1 ? c : { ...c, messages: c.messages.slice(0, index) };
    }),
  }));
}

export function resetDemo(): void {
  setState(() => createSeedState());
}

/* ------------------------- Préférences d'UI ------------------------- */

export interface UiPrefs {
  sidebarCollapsed: boolean;
}

export function readUiPrefs(): UiPrefs {
  try {
    const raw = window.localStorage.getItem(UI_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UiPrefs>;
      return { sidebarCollapsed: parsed.sidebarCollapsed === true };
    }
  } catch {
    // ignore
  }
  return { sidebarCollapsed: false };
}

export function writeUiPrefs(prefs: UiPrefs): void {
  try {
    window.localStorage.setItem(UI_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
