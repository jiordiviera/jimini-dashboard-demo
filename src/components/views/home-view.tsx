"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Composer } from "@/components/composer";
import { FoldersSection } from "@/components/folders-section";
import { PromptChips } from "@/components/prompt-chips";
import { RecentList } from "@/components/recent-list";
import { useConversations } from "@/lib/store";
import type { ComposerSubmit } from "@/lib/types";

interface HomeViewProps {
  draft: string;
  onDraftChange: (value: string) => void;
  focusSignal: number;
  onPickTemplate: (prompt: string) => void;
  onSubmit: (input: ComposerSubmit) => void;
  onOpenConversation: (id: string) => void;
  onOpenFolder: (id: string) => void;
  onCreateFolder: () => void;
  onShowAllFolders: () => void;
  onShowHistory: () => void;
}

export function HomeView({
  draft,
  onDraftChange,
  focusSignal,
  onPickTemplate,
  onSubmit,
  onOpenConversation,
  onOpenFolder,
  onCreateFolder,
  onShowAllFolders,
  onShowHistory,
}: HomeViewProps) {
  const conversations = useConversations();
  const recents = [...conversations]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-[940px] px-4 pb-10 sm:px-8">
      <h1 className="pt-6 text-center font-serif text-[32px] leading-[1.18] font-normal tracking-[-0.01em] text-jm-ink sm:pt-12 sm:text-[42px]">
        Bonjour Jiordi,
        <br />
        Comment puis-je vous aider ?
      </h1>

      <div className="mx-auto mt-8 max-w-[760px] sm:mt-10">
        <Composer
          value={draft}
          onValueChange={onDraftChange}
          onSubmit={onSubmit}
          focusSignal={focusSignal}
        />
        <div className="mt-4">
          <PromptChips onPick={onPickTemplate} />
        </div>
      </div>

      <div className="mt-14 sm:mt-16">
        <FoldersSection
          onOpenFolder={onOpenFolder}
          onCreateFolder={onCreateFolder}
          onShowAll={onShowAllFolders}
        />
      </div>

      <section aria-labelledby="recents-title" className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recents-title" className="text-[17px] font-semibold text-jm-ink">
            Récents
          </h2>
          <button
            type="button"
            onClick={onShowHistory}
            className="inline-flex h-8 items-center gap-0.5 rounded-lg px-2.5 text-[13px] font-medium text-jm-blue transition-colors hover:bg-jm-soft"
          >
            Tout afficher <ChevronRightIcon className="size-3.5 stroke-2" />
          </button>
        </div>
        <RecentList
          conversations={recents}
          onOpen={onOpenConversation}
          onOpenFolder={onOpenFolder}
        />
      </section>
    </div>
  );
}
