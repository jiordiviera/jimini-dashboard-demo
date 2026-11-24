import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarFor, nameFor } from "@/lib/people";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-jm-soft text-jm-blue",
  "bg-jm-teal-soft text-jm-teal-dark",
  "bg-jm-orange-soft text-jm-orange",
  "bg-jm-violet-soft text-jm-violet",
  "bg-jm-rose-soft text-jm-rose",
];

function colorFor(initials: string): string {
  let hash = 0;
  for (const char of initials) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

interface AvatarStackProps {
  initials: string[];
  max?: number;
  size?: "sm" | "md";
  ringClassName?: string;
  className?: string;
}

export function AvatarStack({
  initials,
  max = 3,
  size = "sm",
  ringClassName = "ring-white",
  className,
}: AvatarStackProps) {
  const visible = initials.slice(0, max);
  const rest = initials.length - visible.length;
  const dim = size === "sm" ? "size-6 text-[10px]" : "size-7 text-[11px]";
  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((item, index) => (
        <Avatar
          key={`${item}-${index}`}
          className={cn(dim, "ring-2 after:hidden", ringClassName, index > 0 && "-ml-1.5")}
        >
          <AvatarImage src={avatarFor(item)} alt={nameFor(item)} title={nameFor(item)} />
          <AvatarFallback className={cn("font-semibold", colorFor(item))}>
            {item}
          </AvatarFallback>
        </Avatar>
      ))}
      {rest > 0 && (
        <span
          className={cn(
            dim,
            "-ml-1.5 inline-flex items-center justify-center rounded-full bg-jm-hover font-semibold text-jm-muted ring-2",
            ringClassName,
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
