"use client";

import {
  BookOpenIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  InboxStackIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  SparklesIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { FolderIcon as FolderSolid } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";
import { toast } from "sonner";
import { JiminiLogo } from "@/components/jimini-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFolders } from "@/lib/store";
import type { FeatureKey, View } from "@/lib/types";
import { cn } from "@/lib/utils";

export type InfoKind = "news" | "help" | "settings";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface NavEntry {
  label: string;
  icon: Icon;
  view: View;
  isActive: (view: View) => boolean;
}

function feature(key: FeatureKey) {
  return (view: View) => view.name === "feature" && view.feature === key;
}

const MAIN_NAV: NavEntry[] = [
  {
    label: "Accueil",
    icon: HomeIcon,
    view: { name: "home" },
    isActive: (v) => v.name === "home" || v.name === "chat",
  },
  {
    label: "Grille d'analyse",
    icon: TableCellsIcon,
    view: { name: "feature", feature: "analysis" },
    isActive: feature("analysis"),
  },
  {
    label: "Publipostage IA",
    icon: InboxStackIcon,
    view: { name: "feature", feature: "mailmerge" },
    isActive: feature("mailmerge"),
  },
  {
    label: "Édition de PDF",
    icon: DocumentTextIcon,
    view: { name: "feature", feature: "pdf" },
    isActive: feature("pdf"),
  },
  {
    label: "Contentieux",
    icon: ScaleIcon,
    view: { name: "feature", feature: "litigation" },
    isActive: feature("litigation"),
  },
];

const SECONDARY_NAV: NavEntry[] = [
  {
    label: "Historique",
    icon: ClockIcon,
    view: { name: "history" },
    isActive: (v) => v.name === "history",
  },
  {
    label: "Bibliothèque",
    icon: BookOpenIcon,
    view: { name: "feature", feature: "library" },
    isActive: feature("library"),
  },
];

interface SidebarProps {
  view: View;
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onNavigate: (view: View) => void;
  onCreateFolder: () => void;
  onOpenInfo: (kind: InfoKind) => void;
  className?: string;
}

function WithTooltip({
  enabled,
  label,
  children,
}: {
  enabled: boolean;
  label: string;
  children: React.ReactElement;
}) {
  if (!enabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function NavButton({
  entry,
  active,
  collapsed,
  onClick,
}: {
  entry: NavEntry;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = entry.icon;
  return (
    <WithTooltip enabled={collapsed} label={entry.label}>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? entry.label : undefined}
        className={cn(
          "flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] text-jm-ink-2 transition-colors outline-none hover:bg-white/70 hover:text-jm-ink focus-visible:ring-2 focus-visible:ring-jm-blue/30",
          active &&
            "bg-white font-medium text-jm-ink shadow-[0_1px_2px_rgba(31,35,48,0.06),0_0_0_1px_rgba(231,232,238,0.7)] hover:bg-white",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className={cn("size-[19px] shrink-0", active ? "text-jm-ink" : "text-jm-ink-4")} />
        {!collapsed && <span className="truncate">{entry.label}</span>}
      </button>
    </WithTooltip>
  );
}

export function Sidebar({
  view,
  collapsed,
  onToggleCollapsed,
  onNavigate,
  onCreateFolder,
  onOpenInfo,
  className,
}: SidebarProps) {
  const folders = useFolders();

  const footerIcons: { label: string; icon: Icon; kind: InfoKind }[] = [
    { label: "Paramètres", icon: Cog6ToothIcon, kind: "settings" },
    { label: "Nouveautés", icon: SparklesIcon, kind: "news" },
    { label: "Aide", icon: QuestionMarkCircleIcon, kind: "help" },
  ];

  return (
    <div className={cn("flex h-full flex-col bg-jm-sidebar", className)}>
      <div
        className={cn(
          "flex h-[60px] shrink-0 items-center px-4",
          collapsed ? "justify-center px-0" : "justify-between",
        )}
      >
        {!collapsed && (
          <button
            type="button"
            onClick={() => onNavigate({ name: "home" })}
            className="rounded-md pl-1 outline-none focus-visible:ring-2 focus-visible:ring-jm-blue/30"
            aria-label="Accueil Jimini"
          >
            <JiminiLogo className="h-[25px]" />
          </button>
        )}
        {onToggleCollapsed && (
          <WithTooltip enabled label={collapsed ? "Déplier le menu" : "Replier le menu"}>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
              className="inline-flex size-8 items-center justify-center rounded-lg text-jm-muted transition-colors hover:bg-white/80 hover:text-jm-ink"
            >
              {collapsed ? (
                <ChevronDoubleRightIcon className="size-[18px]" />
              ) : (
                <ChevronDoubleLeftIcon className="size-[18px]" />
              )}
            </button>
          </WithTooltip>
        )}
      </div>

      <div className="jm-thin-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-3">
        <nav aria-label="Navigation principale" className="flex flex-col gap-0.5">
          {MAIN_NAV.map((entry) => (
            <NavButton
              key={entry.label}
              entry={entry}
              active={entry.isActive(view)}
              collapsed={collapsed}
              onClick={() => onNavigate(entry.view)}
            />
          ))}
          <Separator className="my-2.5 bg-jm-divider" />
          {SECONDARY_NAV.map((entry) => (
            <NavButton
              key={entry.label}
              entry={entry}
              active={entry.isActive(view)}
              collapsed={collapsed}
              onClick={() => onNavigate(entry.view)}
            />
          ))}
        </nav>

        {collapsed ? (
          <div className="mt-4 flex flex-col items-center gap-1">
            <Separator className="mb-2 bg-jm-divider" />
            {folders.slice(0, 5).map((folder) => (
              <WithTooltip key={folder.id} enabled label={folder.name}>
                <button
                  type="button"
                  aria-label={folder.name}
                  onClick={() => onNavigate({ name: "folder", id: folder.id })}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-[10px] transition-colors hover:bg-white/70",
                    view.name === "folder" && view.id === folder.id && "bg-white shadow-sm",
                  )}
                >
                  <FolderSolid
                    className={cn(
                      "size-[18px]",
                      folder.tone === "teal" ? "text-jm-teal" : "text-jm-folder",
                    )}
                  />
                </button>
              </WithTooltip>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 mb-1.5 flex items-center justify-between pr-1 pl-2.5">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-jm-subtle uppercase">
                Dossiers
              </span>
              <button
                type="button"
                onClick={onCreateFolder}
                aria-label="Nouveau dossier"
                className="inline-flex size-6 items-center justify-center rounded-md text-jm-muted transition-colors hover:bg-white hover:text-jm-ink"
              >
                <PlusIcon className="size-4 stroke-2" />
              </button>
            </div>
            <ul className="flex flex-col gap-0.5">
              {folders.slice(0, 6).map((folder) => {
                const active = view.name === "folder" && view.id === folder.id;
                return (
                  <li key={folder.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate({ name: "folder", id: folder.id })}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-8 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] text-jm-ink-2 transition-colors hover:bg-white/70 hover:text-jm-ink",
                        active &&
                          "bg-white font-medium text-jm-ink shadow-[0_1px_2px_rgba(31,35,48,0.06),0_0_0_1px_rgba(231,232,238,0.7)]",
                      )}
                    >
                      <FolderSolid
                        className={cn(
                          "size-4 shrink-0",
                          folder.tone === "teal" ? "text-jm-teal" : "text-jm-folder",
                        )}
                      />
                      <span className="truncate">{folder.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => onNavigate({ name: "folders" })}
              className="mt-1 flex h-8 items-center gap-1 rounded-[10px] px-2.5 text-[13px] font-medium text-jm-muted transition-colors hover:bg-white/70 hover:text-jm-ink"
            >
              Tous les dossiers <ChevronRightIcon className="size-3.5 stroke-2" />
            </button>

            <div className="mt-6 rounded-2xl border border-jm-border bg-white p-3.5 shadow-[0_1px_2px_rgba(31,35,48,0.04)]">
              <Badge className="h-5 rounded-md bg-jm-soft px-1.5 text-[10.5px] font-semibold text-jm-blue">
                Inclus dans l&apos;abonnement
              </Badge>
              <p className="mt-2 text-[13px] leading-snug font-semibold text-jm-ink">
                Extensions Jimini
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-jm-muted">
                Ajoutez la puissance de Jimini à vos outils préférés
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {[
                  { label: "Jimini pour Word", letter: "W", tone: "bg-jm-word" },
                  { label: "Jimini pour Outlook", letter: "O", tone: "bg-jm-outlook" },
                ].map((ext) => (
                  <button
                    key={ext.label}
                    type="button"
                    onClick={() =>
                      toast.info(`${ext.label} : complément disponible dans la version complète.`)
                    }
                    className="flex h-8 items-center gap-2 rounded-lg px-1.5 text-[12.5px] font-medium text-jm-ink-2 transition-colors hover:bg-jm-sidebar"
                  >
                    <span
                      className={cn(
                        "inline-flex size-5 items-center justify-center rounded-[5px] text-[10px] font-bold text-white",
                        ext.tone,
                      )}
                    >
                      {ext.letter}
                    </span>
                    <span className="flex-1 text-left">{ext.label}</span>
                    <PlusIcon className="size-4 stroke-2 text-jm-muted" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center border-t border-jm-border px-3 py-3",
          collapsed ? "flex-col gap-2 px-0" : "justify-between gap-2",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5 pl-1">
          <Avatar className="size-8 after:hidden">
            <AvatarFallback className="bg-jm-blue text-[12px] font-semibold text-white">
              JK
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="truncate text-[13.5px] font-medium text-jm-ink">Jiordi Kengne</span>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center">
            {footerIcons.map(({ label, icon: FooterIcon, kind }) => (
              <WithTooltip key={kind} enabled label={label}>
                <button
                  type="button"
                  aria-label={label}
                  onClick={() => onOpenInfo(kind)}
                  className="inline-flex size-7 items-center justify-center rounded-lg text-jm-muted transition-colors hover:bg-white hover:text-jm-ink"
                >
                  <FooterIcon className="size-[17px]" />
                </button>
              </WithTooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
