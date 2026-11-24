"use client";

import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { AvatarStack } from "@/components/avatar-stack";
import { FolderMenu } from "@/components/folder-menu";
import { toggleFolderStar } from "@/lib/store";
import type { Folder } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONES = {
  periwinkle: {
    back: "var(--jm-folder-dark)",
    front: "from-jm-folder-light via-jm-folder-mid to-jm-folder",
    ring: "ring-jm-folder-ring",
  },
  teal: {
    back: "var(--jm-teal-dark)",
    front: "from-jm-teal-light via-jm-teal-mid to-jm-teal",
    ring: "ring-jm-teal-ring",
  },
} as const;

interface FolderCardProps {
  folder: Folder;
  onOpen: () => void;
  className?: string;
}

export function FolderCard({ folder, onOpen, className }: FolderCardProps) {
  const tone = TONES[folder.tone];
  const docLabel = `${folder.docCount} document${folder.docCount > 1 ? "s" : ""}`;

  return (
    <div
      className={cn(
        "group relative h-[156px] w-[212px] shrink-0 snap-start transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Dos de la chemise, avec son onglet */}
      <svg
        aria-hidden
        viewBox="0 0 212 156"
        className="absolute inset-0 h-full w-full drop-shadow-[0_6px_14px_rgba(76,99,230,0.14)]"
      >
        <path
          d="M0 16C0 7.163 7.163 0 16 0H70.5C75.6 0 80.4 2.4 83.4 6.5L88.6 13.5C90.1 15.4 92.4 16.6 94.8 16.6H196C204.837 16.6 212 23.763 212 32.6V140C212 148.837 204.837 156 196 156H16C7.163 156 0 148.837 0 140V16Z"
          fill={tone.back}
        />
      </svg>
      {/* Feuille qui dépasse */}
      <div
        aria-hidden
        className="absolute inset-x-4 top-[14px] h-10 rotate-[-1.5deg] rounded-md bg-white/95 shadow-sm transition-transform duration-200 group-hover:-translate-y-1"
      />
      {/* Face avant */}
      <div
        className={cn(
          "absolute inset-x-0 top-[26px] bottom-0 flex flex-col justify-between rounded-[16px] bg-gradient-to-br p-3.5 pl-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
          tone.front,
        )}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ouvrir le dossier ${folder.name}`}
          className="absolute inset-0 rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        />
        <div className="relative flex items-center gap-0.5 text-white/85">
          <AvatarStack
            initials={folder.members}
            ringClassName={tone.ring}
            className="pointer-events-none mr-auto"
          />
          <button
            type="button"
            aria-label={folder.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={folder.starred}
            onClick={() => toggleFolderStar(folder.id)}
            className="inline-flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-white/15 hover:text-white"
          >
            {folder.starred ? (
              <StarSolid className="size-[17px] text-white" />
            ) : (
              <StarOutline className="size-[17px]" />
            )}
          </button>
          <FolderMenu
            folder={folder}
            onOpen={onOpen}
            triggerClassName="hover:bg-white/15 hover:text-white data-popup-open:bg-white/15"
          />
        </div>
        <div className="pointer-events-none relative min-w-0">
          <p className="truncate text-[15px] leading-tight font-semibold text-white">
            {folder.name}
          </p>
          <p className="mt-1 text-[12px] text-white/80">{docLabel}</p>
        </div>
      </div>
    </div>
  );
}
