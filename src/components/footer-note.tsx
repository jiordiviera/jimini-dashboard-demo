import Link from "next/link";
import { cn } from "@/lib/utils";

export function FooterNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-[11.5px] text-jm-faint", className)}>
      Démo non officielle réalisée par Jiordi Kengne ·{" "}
      <a
        href="https://jiordiviera.me"
        target="_blank"
        rel="noreferrer"
        className="underline-offset-2 hover:text-jm-muted hover:underline"
      >
        jiordiviera.me
      </a>{" "}
      ·{" "}
      <Link
        href="/comment-je-l-ai-construit"
        className="underline-offset-2 hover:text-jm-muted hover:underline"
      >
        Comment je l&apos;ai construit
      </Link>
    </p>
  );
}
