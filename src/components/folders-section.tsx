"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import { FolderCard } from "@/components/folder-card";
import { Input } from "@/components/ui/input";
import { useFolders } from "@/lib/store";
import { cn, normalize } from "@/lib/utils";

interface FoldersSectionProps {
  onOpenFolder: (id: string) => void;
  onCreateFolder: () => void;
  onShowAll: () => void;
}

export function FoldersSection({ onOpenFolder, onCreateFolder, onShowAll }: FoldersSectionProps) {
  const folders = useFolders();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? folders.filter((f) => normalize(f.name).includes(normalize(query.trim())))
    : folders;

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateArrows);
    };
  }, [updateArrows]);

  useEffect(() => {
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [filtered.length, updateArrows]);

  const scrollBy = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * 456, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="folders-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="folders-title" className="text-[17px] font-semibold text-jm-ink">
          Mes dossiers
        </h2>
        <div className="flex items-center gap-1">
          {searching ? (
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-jm-muted" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    setSearching(false);
                  }
                }}
                placeholder="Rechercher un dossier"
                className="h-8 w-[180px] rounded-lg bg-white pr-8 pl-8 text-[13px] sm:w-[220px]"
              />
              <button
                type="button"
                aria-label="Fermer la recherche"
                onClick={() => {
                  setQuery("");
                  setSearching(false);
                }}
                className="absolute top-1/2 right-1.5 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-jm-muted hover:text-jm-ink"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearching(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-jm-ink-3 transition-colors hover:bg-jm-hover hover:text-jm-ink"
            >
              <MagnifyingGlassIcon className="size-4" />
              <span className="hidden sm:inline">Recherche</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCreateFolder}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-jm-ink-3 transition-colors hover:bg-jm-hover hover:text-jm-ink"
          >
            Nouveau <PlusIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={onShowAll}
            className="inline-flex h-8 items-center gap-0.5 rounded-lg px-2.5 text-[13px] font-medium text-jm-blue transition-colors hover:bg-jm-soft"
          >
            Tout afficher <ChevronRightIcon className="size-3.5 stroke-2" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-jm-border-strong px-6 py-10 text-center text-[13.5px] text-jm-muted">
          Aucun dossier ne correspond à « {query} ».
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            className="jm-scrollbar-none -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pt-1 pb-3"
          >
            {filtered.map((folder) => (
              <FolderCard key={folder.id} folder={folder} onOpen={() => onOpenFolder(folder.id)} />
            ))}
          </div>
          <CarouselArrow side="left" visible={canPrev} onClick={() => scrollBy(-1)} />
          <CarouselArrow side="right" visible={canNext} onClick={() => scrollBy(1)} />
        </div>
      )}
    </section>
  );
}

function CarouselArrow({
  side,
  visible,
  onClick,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Dossiers précédents" : "Dossiers suivants"}
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "absolute top-[calc(50%-6px)] z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-jm-border bg-white text-jm-ink shadow-[0_4px_14px_rgba(31,35,48,0.12)] transition-all hover:scale-105",
        side === "left" ? "-left-3" : "-right-3",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-4 stroke-2" />
    </button>
  );
}
