import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  InboxStackIcon,
  PencilSquareIcon,
  ScaleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import type { ConversationKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAP: Record<
  ConversationKind,
  { Icon: typeof ChatBubbleLeftRightIcon; className: string }
> = {
  chat: { Icon: ChatBubbleLeftRightIcon, className: "bg-jm-soft text-jm-blue" },
  draft: { Icon: PencilSquareIcon, className: "bg-jm-hover text-jm-ink-3" },
  analysis: { Icon: TableCellsIcon, className: "bg-jm-teal-soft text-jm-teal-dark" },
  mailmerge: { Icon: InboxStackIcon, className: "bg-jm-violet-soft text-jm-violet" },
  litigation: { Icon: ScaleIcon, className: "bg-jm-orange-soft text-jm-orange" },
  pdf: { Icon: DocumentTextIcon, className: "bg-jm-rose-soft text-jm-rose" },
};

export function ConversationIcon({
  kind,
  className,
}: {
  kind: ConversationKind;
  className?: string;
}) {
  const { Icon, className: tone } = MAP[kind];
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-[10px]",
        tone,
        className,
      )}
    >
      <Icon className="size-[17px]" />
    </span>
  );
}
