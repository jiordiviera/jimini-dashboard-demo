export type ChatMode = "rapide" | "reflexion";

export type ConversationKind =
  | "chat"
  | "draft"
  | "analysis"
  | "mailmerge"
  | "litigation"
  | "pdf";

export interface Folder {
  id: string;
  name: string;
  docCount: number;
  starred: boolean;
  tone: "periwinkle" | "teal";
  members: string[];
  createdAt: number;
}

export interface ChatDocument {
  id: string;
  name: string;
  text: string;
  pages: number | null;
  size: number;
}

export interface AttachmentRef {
  name: string;
  pages: number | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: AttachmentRef[];
  createdAt: number;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  kind: ConversationKind;
  folderId: string | null;
  messages: ChatMessage[];
  documents: ChatDocument[];
  mode: ChatMode;
  sources: boolean;
  members: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  version: number;
  folders: Folder[];
  conversations: Conversation[];
}

export type FeatureKey =
  | "analysis"
  | "mailmerge"
  | "pdf"
  | "litigation"
  | "library";

export type View =
  | { name: "home" }
  | { name: "chat"; id: string }
  | { name: "folder"; id: string }
  | { name: "folders" }
  | { name: "history" }
  | { name: "feature"; feature: FeatureKey };

export interface ComposerSubmit {
  text: string;
  documents: ChatDocument[];
  mode: ChatMode;
  sources: boolean;
}

export interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  mode: ChatMode;
  sources: boolean;
  documents: { name: string; text: string }[];
}
