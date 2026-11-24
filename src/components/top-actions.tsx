"use client";

import { BellIcon, FlagIcon } from "@heroicons/react/24/outline";
import type { InfoKind } from "@/components/sidebar";

const pill =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-jm-border bg-white px-3 text-[13px] font-medium text-jm-ink-2 shadow-[0_1px_1px_rgba(31,35,48,0.03)] transition-colors hover:bg-jm-hover-soft hover:text-jm-ink";

export function TopActions({ onOpenInfo }: { onOpenInfo: (kind: InfoKind) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={pill} onClick={() => onOpenInfo("news")}>
        <BellIcon className="size-4" />
        <span className="hidden sm:inline">Nouveautés</span>
      </button>
      <button type="button" className={pill} onClick={() => onOpenInfo("help")}>
        <FlagIcon className="size-4" />
        <span className="hidden sm:inline">Aide</span>
      </button>
    </div>
  );
}
