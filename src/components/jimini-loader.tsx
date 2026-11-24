import { J_BODY_PATH as J_BODY, J_DOT_PATH as J_DOT } from "@/lib/brand";
import { cn } from "@/lib/utils";


interface JiminiLoaderProps {
  /** Texte affiché à droite du « j » ; omis pour un loader seul. */
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-4",
  md: "h-6",
  lg: "h-12",
};

/** Loader aux couleurs de Jimini : le point du « j » rebondit pendant que le corps respire. */
export function JiminiLoader({ label, size = "md", className }: JiminiLoaderProps) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex">
        <span
          aria-hidden
          className="absolute inset-[-35%] rounded-full bg-jm-soft opacity-70 motion-safe:animate-[jm-halo_1.6s_ease-in-out_infinite]"
        />
        <svg
          aria-hidden
          viewBox="-2 -12 36 72"
          className={cn("relative w-auto overflow-visible text-jm-blue", SIZES[size])}
          fill="currentColor"
        >
          <path
            d={J_BODY}
            className="origin-[50%_100%] motion-safe:animate-[jm-breathe_1.6s_ease-in-out_infinite]"
            style={{ transformBox: "fill-box" }}
          />
          <path
            d={J_DOT}
            className="text-jm-teal motion-safe:animate-[jm-hop_1.6s_cubic-bezier(.45,0,.2,1)_infinite]"
            fill="currentColor"
          />
        </svg>
      </span>
      {label ? (
        <span className="bg-[linear-gradient(90deg,var(--jm-muted)_0%,var(--jm-ink)_50%,var(--jm-muted)_100%)] bg-[length:200%_100%] bg-clip-text text-[13.5px] text-transparent motion-safe:animate-[jm-shimmer_2s_linear_infinite]">
          {label}
        </span>
      ) : (
        <span className="sr-only">Chargement…</span>
      )}
    </span>
  );
}
