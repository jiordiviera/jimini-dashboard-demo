"use client";

import { ArrowLeftIcon, StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { FolderIcon, StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useState } from "react";
import { AvatarStack } from "@/components/avatar-stack";
import { Composer } from "@/components/composer";
import { FolderMenu } from "@/components/folder-menu";
import { RecentList } from "@/components/recent-list";
import { toggleFolderStar, useConversations, useFolders } from "@/lib/store";
import type { ComposerSubmit } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FolderViewProps {
  folderId: string;
  onBack: () => void;
  onOpenConversation: (id: string) => void;
  onSubmit: (input: ComposerSubmit, folderId: string) => void;
}

export function FolderView({ folderId, onBack, onOpenConversation, onSubmit }: FolderViewProps) {
  const folder = useFolders().find((f) => f.id === folderId);
  const conversations = useConversations()
    .filter((c) => c.folderId === folderId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const [draft, setDraft] = useState("");

  if (!folder) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <p className="font-serif text-[24px] text-jm-ink">Dossier introuvable</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-jm-blue px-4 py-2 text-[14px] font-medium text-white hover:bg-jm-blue-hover"
        >
          Voir tous les dossiers
        </button>
      </div>
    );
  }

  const teal = folder.tone === "teal";

  return (
    <div className="mx-auto w-full max-w-[940px] px-4 pb-10 sm:px-8">
      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-jm-muted hover:bg-jm-hover hover:text-jm-ink sm:mt-6"
      >
        <ArrowLeftIcon className="size-4" /> Tous les dossiers
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span
          className={cn(
            "inline-flex size-14 shrink-0 items-center justify-center rounded-2xl",
            teal ? "bg-jm-teal-soft" : "bg-jm-soft",
          )}
        >
          <FolderIcon className={cn("size-7", teal ? "text-jm-teal" : "text-jm-folder")} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-[30px] leading-tight text-jm-ink">
            {folder.name}
          </h1>
          <p className="mt-0.5 text-[13.5px] text-jm-muted">
            {folder.docCount} document{folder.docCount > 1 ? "s" : ""} · {conversations.length}{" "}
            conversation{conversations.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <AvatarStack initials={folder.members} size="md" className="mr-2" />
          <button
            type="button"
            onClick={() => toggleFolderStar(folder.id)}
            aria-pressed={folder.starred}
            aria-label={folder.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
            className="inline-flex size-9 items-center justify-center rounded-lg text-jm-muted hover:bg-jm-hover hover:text-jm-ink"
          >
            {folder.starred ? (
              <StarSolid className="size-5 text-jm-star" />
            ) : (
              <StarOutline className="size-5" />
            )}
          </button>
          <FolderMenu
            folder={folder}
            onDeleted={onBack}
            triggerClassName="size-9 text-jm-muted hover:bg-jm-hover hover:text-jm-ink"
          />
        </div>
      </div>

      <div className="mt-8">
        <Composer
          key={folder.id}
          variant="compact"
          value={draft}
          onValueChange={setDraft}
          placeholder={`Poser une question dans « ${folder.name} »…`}
          onSubmit={(input) => {
            onSubmit(input, folder.id);
            setDraft("");
          }}
        />
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-[17px] font-semibold text-jm-ink">Conversations du dossier</h2>
        <RecentList
          conversations={conversations}
          onOpen={onOpenConversation}
          emptyLabel="Aucune conversation dans ce dossier. Posez une première question ci-dessus, ou rattachez une conversation existante depuis son menu « … »."
        />
      </section>
    </div>
  );
}
