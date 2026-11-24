"use client";

import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { FolderCard } from "@/components/folder-card";
import { Input } from "@/components/ui/input";
import { useFolders } from "@/lib/store";
import { normalize } from "@/lib/utils";

interface FoldersViewProps {
  onOpenFolder: (id: string) => void;
  onCreateFolder: () => void;
}

export function FoldersView({ onOpenFolder, onCreateFolder }: FoldersViewProps) {
  const folders = useFolders();
  const [query, setQuery] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const q = normalize(query.trim());
  const filtered = folders.filter(
    (f) => (!q || normalize(f.name).includes(q)) && (!starredOnly || f.starred),
  );

  return (
    <div className="mx-auto w-full max-w-[940px] px-4 pb-10 sm:px-8">
      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between sm:pt-10">
        <div>
          <h1 className="font-serif text-[32px] leading-tight text-jm-ink">Tous les dossiers</h1>
          <p className="mt-1 text-[14px] text-jm-muted">
            {folders.length} dossier{folders.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateFolder}
          className="inline-flex h-10 items-center gap-1.5 self-start rounded-xl bg-jm-blue px-4 text-[14px] font-medium text-white shadow-[0_4px_12px_-4px_rgba(76,99,230,0.6)] transition-colors hover:bg-jm-blue-hover sm:self-auto"
        >
          <PlusIcon className="size-4 stroke-2" /> Nouveau dossier
        </button>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-[300px]">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-jm-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un dossier"
            aria-label="Rechercher un dossier"
            className="h-10 rounded-xl bg-white pl-9 text-[14px]"
          />
        </div>
        <button
          type="button"
          aria-pressed={starredOnly}
          onClick={() => setStarredOnly((v) => !v)}
          className={
            starredOnly
              ? "h-10 rounded-xl bg-jm-soft px-3.5 text-[13.5px] font-medium text-jm-blue"
              : "h-10 rounded-xl border border-jm-border bg-white px-3.5 text-[13.5px] font-medium text-jm-ink-2 hover:bg-jm-hover-soft"
          }
        >
          Favoris uniquement
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-jm-border-strong px-6 py-12 text-center text-[13.5px] text-jm-muted">
          Aucun dossier ne correspond.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(212px,1fr))] justify-items-center gap-x-4 gap-y-6 sm:justify-items-start">
          {filtered.map((folder) => (
            <FolderCard key={folder.id} folder={folder} onOpen={() => onOpenFolder(folder.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
