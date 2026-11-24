"use client";

import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
  FolderArrowDownIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TextPromptDialog } from "@/components/text-prompt-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteConversation,
  moveConversation,
  renameConversation,
  useFolders,
} from "@/lib/store";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConversationMenuProps {
  conversation: Conversation;
  onOpen?: () => void;
  onDeleted?: () => void;
  triggerClassName?: string;
}

export function ConversationMenu({
  conversation,
  onOpen,
  onDeleted,
  triggerClassName,
}: ConversationMenuProps) {
  const folders = useFolders();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Plus d'actions"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg text-jm-muted transition-colors outline-none hover:bg-jm-hover hover:text-jm-ink focus-visible:ring-2 focus-visible:ring-jm-blue/40 data-popup-open:bg-jm-hover",
            triggerClassName,
          )}
        >
          <EllipsisHorizontalIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
          {onOpen && (
            <DropdownMenuItem onClick={onOpen}>
              <ArrowTopRightOnSquareIcon /> Ouvrir
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setRenaming(true)}>
            <PencilIcon /> Renommer
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderArrowDownIcon /> Rattacher à un dossier
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56 rounded-xl p-1.5">
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => {
                    moveConversation(conversation.id, folder.id);
                    toast.success(`Rattachée à « ${folder.name} »`);
                  }}
                  className={cn(
                    conversation.folderId === folder.id && "font-semibold text-jm-blue",
                  )}
                >
                  <FolderIcon /> {folder.name}
                </DropdownMenuItem>
              ))}
              {conversation.folderId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      moveConversation(conversation.id, null);
                      toast.success("Retirée du dossier");
                    }}
                  >
                    <XMarkIcon /> Retirer du dossier
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
            <TrashIcon /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TextPromptDialog
        open={renaming}
        onOpenChange={setRenaming}
        title="Renommer la conversation"
        label="Titre"
        initialValue={conversation.title}
        confirmLabel="Renommer"
        onConfirm={(value) => renameConversation(conversation.id, value)}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Supprimer la conversation ?"
        description={`« ${conversation.title} » sera supprimée de cet appareil. Cette action est irréversible.`}
        onConfirm={() => {
          deleteConversation(conversation.id);
          toast.success("Conversation supprimée");
          onDeleted?.();
        }}
      />
    </>
  );
}
