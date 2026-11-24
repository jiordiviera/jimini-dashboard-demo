"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { RecentList } from "@/components/recent-list";
import { Input } from "@/components/ui/input";
import { useConversations, useFolders } from "@/lib/store";
import { normalize } from "@/lib/utils";

interface HistoryViewProps {
  onOpenConversation: (id: string) => void;
  onOpenFolder: (id: string) => void;
}

export function HistoryView({ onOpenConversation, onOpenFolder }: HistoryViewProps) {
  const conversations = useConversations();
  const folders = useFolders();
  const [query, setQuery] = useState("");

  const folderNames = new Map(folders.map((f) => [f.id, f.name]));
  const q = normalize(query.trim());
  const filtered = [...conversations]
    .filter((c) => {
      if (!q) return true;
      const haystack = normalize(
        [
          c.title,
          c.folderId ? folderNames.get(c.folderId) ?? "" : "",
          ...c.messages.map((m) => m.content),
        ].join(" "),
      );
      return haystack.includes(q);
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="mx-auto w-full max-w-[940px] px-4 pb-10 sm:px-8">
      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between sm:pt-10">
        <div>
          <h1 className="font-serif text-[32px] leading-tight text-jm-ink">Historique</h1>
          <p className="mt-1 text-[14px] text-jm-muted">
            {conversations.length} conversation{conversations.length > 1 ? "s" : ""}{" "}
            enregistrée{conversations.length > 1 ? "s" : ""} sur cet appareil
          </p>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-jm-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans l'historique"
            aria-label="Rechercher dans l'historique"
            className="h-10 rounded-xl bg-white pl-9 text-[14px]"
          />
        </div>
      </div>
      <div className="mt-8">
        <RecentList
          conversations={filtered}
          onOpen={onOpenConversation}
          onOpenFolder={onOpenFolder}
          emptyLabel={
            query ? `Aucun résultat pour « ${query} ».` : "Aucune conversation pour le moment."
          }
        />
      </div>
    </div>
  );
}
