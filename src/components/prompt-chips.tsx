"use client";

import {
  ChevronRightIcon,
  InboxStackIcon,
  LanguageIcon,
  SparklesIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHIP_TEMPLATES, MORE_TEMPLATES } from "@/lib/prompts";

const ICONS: Record<string, typeof SparklesIcon> = {
  magic: SparklesIcon,
  analysis: TableCellsIcon,
  mailmerge: InboxStackIcon,
  translate: LanguageIcon,
};

const chipClass =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-jm-border bg-white px-3 text-[13px] font-medium text-jm-ink-2 shadow-[0_1px_1px_rgba(31,35,48,0.03)] transition-colors outline-none hover:border-jm-border-accent hover:bg-jm-hover-soft hover:text-jm-ink focus-visible:ring-2 focus-visible:ring-jm-blue/30";

export function PromptChips({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {CHIP_TEMPLATES.map((template) => {
        const Icon = ICONS[template.id] ?? SparklesIcon;
        return (
          <button
            key={template.id}
            type="button"
            className={chipClass}
            onClick={() => onPick(template.prompt)}
          >
            <Icon className="size-4 text-jm-muted" />
            {template.label}
          </button>
        );
      })}
      <DropdownMenu>
        <DropdownMenuTrigger className={`${chipClass} data-popup-open:bg-jm-hover-soft`}>
          Plus <ChevronRightIcon className="size-3.5 stroke-2 text-jm-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64 rounded-xl p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Modèles</DropdownMenuLabel>
            {MORE_TEMPLATES.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => onPick(template.prompt)}
                className="py-2"
              >
                {template.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
