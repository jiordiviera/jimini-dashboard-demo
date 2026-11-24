"use client";

import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  InboxStackIcon,
  ScaleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { FEATURES } from "@/lib/prompts";
import type { FeatureKey } from "@/lib/types";

const ICONS: Record<FeatureKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  analysis: TableCellsIcon,
  mailmerge: InboxStackIcon,
  pdf: DocumentTextIcon,
  litigation: ScaleIcon,
  library: BookOpenIcon,
};

interface FeatureViewProps {
  feature: FeatureKey;
  onTry: (prompt: string) => void;
}

function Preview({ feature }: { feature: FeatureKey }) {
  if (feature === "analysis") {
    const rows = [
      ["Durée", "Tacite reconduction sans préavis", "Élevée"],
      ["Responsabilité", "Plafond non défini", "Moyenne"],
      ["Résiliation", "Unilatérale au profit du bailleur", "Élevée"],
      ["Confidentialité", "Clause standard", "Faible"],
    ];
    return (
      <div className="overflow-hidden rounded-xl border border-jm-border bg-white text-[12.5px]">
        <div className="grid grid-cols-[1fr_1.6fr_0.8fr] bg-jm-table-head px-3 py-2 font-semibold text-jm-ink">
          <span>Clause</span>
          <span>Risque</span>
          <span>Gravité</span>
        </div>
        {rows.map(([clause, risk, level]) => (
          <div
            key={clause}
            className="grid grid-cols-[1fr_1.6fr_0.8fr] border-t border-jm-line px-3 py-2 text-jm-ink-2"
          >
            <span className="font-medium">{clause}</span>
            <span className="truncate pr-2">{risk}</span>
            <span
              className={
                level === "Élevée"
                  ? "text-jm-rose"
                  : level === "Moyenne"
                    ? "text-jm-orange"
                    : "text-jm-teal-dark"
              }
            >
              {level}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2.5 rounded-xl border border-jm-border bg-white p-4">
      {[92, 78, 85, 60, 70].map((width, i) => (
        <div
          key={i}
          className="h-2.5 rounded-full bg-jm-skeleton"
          style={{ width: `${width}%` }}
        />
      ))}
      <div className="mt-3 rounded-lg bg-jm-soft px-3 py-2 text-[12.5px] text-jm-blue">
        Jimini propose 3 modifications…
      </div>
    </div>
  );
}

export function FeatureView({ feature, onTry }: FeatureViewProps) {
  const info = FEATURES[feature];
  const Icon = ICONS[feature];

  return (
    <div className="mx-auto w-full max-w-[940px] px-4 pb-10 sm:px-8">
      <div className="grid items-center gap-10 pt-8 sm:pt-16 md:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-jm-soft text-jm-blue">
            <Icon className="size-6" />
          </span>
          <h1 className="mt-5 font-serif text-[36px] leading-tight text-jm-ink">{info.title}</h1>
          <p className="mt-2 text-[17px] text-jm-ink-2">{info.tagline}</p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-jm-muted">{info.description}</p>
          <ul className="mt-6 grid gap-2.5">
            {info.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5 text-[14px] text-jm-ink-2">
                <CheckCircleIcon className="mt-0.5 size-[18px] shrink-0 text-jm-teal" />
                {bullet}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onTry(info.prompt)}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-jm-blue px-5 text-[14.5px] font-medium text-white shadow-[0_6px_16px_-6px_rgba(76,99,230,0.7)] transition-colors hover:bg-jm-blue-hover"
          >
            Essayer dans le chat <ArrowRightIcon className="size-4 stroke-2" />
          </button>
        </div>
        <div className="rounded-[22px] border border-jm-border bg-jm-sidebar p-5 shadow-[0_12px_32px_-16px_rgba(31,35,48,0.14)]">
          <p className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-jm-subtle uppercase">
            Aperçu
          </p>
          <Preview feature={feature} />
          <p className="mt-4 rounded-xl bg-white px-3.5 py-3 text-[13px] leading-relaxed text-jm-ink-3">
            <span className="font-medium text-jm-ink">Prompt : </span>
            {info.prompt}
          </p>
        </div>
      </div>
    </div>
  );
}
