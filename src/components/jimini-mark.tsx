import { J_BODY_PATH, J_DOT_PATH } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Pastille ronde avec le « j » de Jimini, utilisée comme avatar de l'assistant. */
export function JiminiMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-jm-blue text-white",
        className,
      )}
    >
      <svg viewBox="-2 -2 36 63" className="h-4 w-auto" fill="currentColor">
        <path d={J_BODY_PATH} />
        <path d={J_DOT_PATH} />
      </svg>
    </span>
  );
}
