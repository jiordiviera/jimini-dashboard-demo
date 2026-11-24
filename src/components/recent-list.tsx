"use client";

import { FolderIcon, LockClosedIcon, ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AvatarStack } from "@/components/avatar-stack";
import { ConversationIcon } from "@/components/conversation-icon";
import { ConversationMenu } from "@/components/conversation-menu";
import { useFolders } from "@/lib/store";
import type { Conversation } from "@/lib/types";
import { cn, formatRelativeDay } from "@/lib/utils";

interface RecentListProps {
  conversations: Conversation[];
  onOpen: (id: string) => void;
  onOpenFolder?: (id: string) => void;
  emptyLabel?: string;
}

async function shareConversation(conversation: Conversation) {
  const markdown = [
    `# ${conversation.title}`,
    ...conversation.messages.map(
      (m) => `\n**${m.role === "user" ? "Question" : "Jimini"}**\n\n${m.content}`,
    ),
  ].join("\n");
  try {
    await navigator.clipboard.writeText(markdown);
    toast.success("Conversation copiée en Markdown, prête à partager");
  } catch {
    toast.error("Impossible d'accéder au presse-papiers");
  }
}

export function RecentList({
  conversations,
  onOpen,
  onOpenFolder,
  emptyLabel = "Aucune conversation pour le moment.",
}: RecentListProps) {
  const folders = useFolders();
  const folderById = new Map(folders.map((f) => [f.id, f]));

  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-jm-border-strong px-6 py-10 text-center text-[13.5px] text-jm-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="-mx-2 flex flex-col">
      {conversations.map((conversation) => {
        const folder = conversation.folderId
          ? folderById.get(conversation.folderId)
          : undefined;
        const date = formatRelativeDay(conversation.updatedAt);
        return (
          <li key={conversation.id} className="group relative">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors group-hover:bg-white group-hover:shadow-[0_1px_2px_rgba(31,35,48,0.05),0_0_0_1px_rgba(231,232,238,0.9)]">
              <ConversationIcon kind={conversation.kind} />
              <button
                type="button"
                onClick={() => onOpen(conversation.id)}
                className="min-w-0 flex-1 text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-jm-blue/40"
              >
                <span className="block truncate text-[14px] font-medium text-jm-ink">
                  {conversation.title}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-jm-muted md:hidden">
                  {date}
                  {folder ? ` · ${folder.name}` : ""}
                </span>
              </button>
              <span className="hidden w-[118px] shrink-0 text-[13px] text-jm-muted md:block">
                {date}
              </span>
              <span className="relative z-10 hidden w-[160px] shrink-0 lg:block">
                {folder && (
                  <button
                    type="button"
                    onClick={() => onOpenFolder?.(folder.id)}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-jm-chip px-2 py-1 text-[12px] font-medium text-jm-ink-3 transition-colors hover:bg-jm-soft hover:text-jm-blue"
                  >
                    <FolderIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                )}
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-[12.5px] text-jm-muted sm:inline-flex">
                Privé <LockClosedIcon className="size-3.5" />
              </span>
              <button
                type="button"
                aria-label="Partager"
                onClick={() => void shareConversation(conversation)}
                className="relative z-10 hidden size-8 shrink-0 items-center justify-center rounded-lg text-jm-muted transition-colors hover:bg-jm-hover hover:text-jm-ink sm:inline-flex"
              >
                <ShareIcon className="size-[17px]" />
              </button>
              <AvatarStack
                initials={conversation.members}
                className="hidden shrink-0 md:flex"
              />
              <span className={cn("relative z-10 shrink-0")}>
                <ConversationMenu
                  conversation={conversation}
                  onOpen={() => onOpen(conversation.id)}
                />
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
