"use client";

import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteFolder, renameFolder, toggleFolderStar } from "@/lib/store";
import type { Folder } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FolderMenuProps {
  folder: Folder;
  onOpen?: () => void;
  onDeleted?: () => void;
  triggerClassName?: string;
}

export function FolderMenu({ folder, onOpen, onDeleted, triggerClassName }: FolderMenuProps) {
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions pour ${folder.name}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/70",
            triggerClassName,
          )}
        >
          <EllipsisHorizontalIcon className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
          {onOpen && (
            <DropdownMenuItem onClick={onOpen}>
              <ArrowTopRightOnSquareIcon /> Ouvrir
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setRenaming(true)}>
            <PencilIcon /> Renommer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleFolderStar(folder.id)}>
            <StarIcon /> {folder.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
            <TrashIcon /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TextPromptDialog
        open={renaming}
        onOpenChange={setRenaming}
        title="Renommer le dossier"
        label="Nom du dossier"
        initialValue={folder.name}
        confirmLabel="Renommer"
        onConfirm={(value) => {
          renameFolder(folder.id, value);
          toast.success("Dossier renommé");
        }}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Supprimer le dossier ?"
        description={`« ${folder.name} » sera supprimé. Ses conversations sont conservées et détachées du dossier.`}
        onConfirm={() => {
          deleteFolder(folder.id);
          toast.success("Dossier supprimé");
          onDeleted?.();
        }}
      />
    </>
  );
}
