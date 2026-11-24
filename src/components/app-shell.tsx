"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useChatRunner } from "@/components/chat-runner-provider";
import { ChatView } from "@/components/chat-view";
import { FooterNote } from "@/components/footer-note";
import { InfoDialog } from "@/components/info-dialog";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import { JiminiLogo } from "@/components/jimini-logo";
import { Sidebar, type InfoKind } from "@/components/sidebar";
import { TextPromptDialog } from "@/components/text-prompt-dialog";
import { TopActions } from "@/components/top-actions";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { FeatureView } from "@/components/views/feature-view";
import { FolderView } from "@/components/views/folder-view";
import { FoldersView } from "@/components/views/folders-view";
import { HistoryView } from "@/components/views/history-view";
import { HomeView } from "@/components/views/home-view";
import { useProfileState } from "@/lib/profile";
import { DEMO_CONVERSATION_ID } from "@/lib/seed";
import { createFolder, readUiPrefs, takeFreshSeed, writeUiPrefs } from "@/lib/store";
import type { ComposerSubmit, View } from "@/lib/types";
import { cn } from "@/lib/utils";
import { hashFromView, viewFromHash } from "@/lib/view-hash";

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

const getHash = () => window.location.hash;
const getServerHash = () => "";

function useCollapsedPref(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const prefs = readUiPrefs();
    if (prefs.sidebarCollapsed) {
      const id = requestAnimationFrame(() => setCollapsed(true));
      return () => cancelAnimationFrame(id);
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      writeUiPrefs({ sidebarCollapsed: !prev });
      return !prev;
    });
  }, []);

  return [collapsed, toggle];
}

export function AppShell() {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const view = viewFromHash(hash);
  const { send } = useChatRunner();
  const profileState = useProfileState();
  const [collapsed, toggleCollapsed] = useCollapsedPref();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [info, setInfo] = useState<InfoKind | null>(null);
  const [draft, setDraft] = useState("");
  const [focusSignal, setFocusSignal] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Premier chargement : on ouvre directement la conversation de démo (bail commenté).
  useEffect(() => {
    if (takeFreshSeed() && !window.location.hash.replace(/^#\/?/, "")) {
      window.location.hash = hashFromView({ name: "chat", id: DEMO_CONVERSATION_ID });
    }
  }, []);

  const navigate = useCallback((next: View) => {
    setMobileOpen(false);
    const target = hashFromView(next);
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  const prefill = useCallback(
    (prompt: string) => {
      setDraft(prompt);
      setFocusSignal((n) => n + 1);
      navigate({ name: "home" });
    },
    [navigate],
  );

  const submitFromHome = useCallback(
    (input: ComposerSubmit, folderId: string | null = null) => {
      const id = send(input, { folderId });
      setDraft("");
      navigate({ name: "chat", id });
    },
    [navigate, send],
  );

  const sidebarProps = {
    view,
    onNavigate: navigate,
    onCreateFolder: () => setCreatingFolder(true),
    onOpenInfo: setInfo,
  };

  const isChat = view.name === "chat";

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-jm-page">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-jm-border transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        <Sidebar {...sidebarProps} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[280px] max-w-[85vw] gap-0 border-r-0 bg-jm-sidebar p-0"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Sidebar {...sidebarProps} collapsed={false} />
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            "flex h-[56px] shrink-0 items-center justify-between gap-2 px-3 sm:px-6",
            isChat && "lg:hidden",
          )}
        >
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              className="inline-flex size-9 items-center justify-center rounded-lg text-jm-ink-2 hover:bg-jm-hover"
            >
              <Bars3Icon className="size-5" />
            </button>
            <button type="button" onClick={() => navigate({ name: "home" })} aria-label="Accueil">
              <JiminiLogo className="h-[22px]" />
            </button>
          </div>
          <div className="ml-auto">{!isChat && <TopActions onOpenInfo={setInfo} />}</div>
        </div>

        {isChat ? (
          <div className="min-h-0 flex-1">
            <ChatView
              key={view.id}
              conversationId={view.id}
              onBack={() => navigate({ name: "home" })}
            />
          </div>
        ) : (
          <div ref={scrollRef} className="jm-thin-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            {view.name === "home" && (
              <HomeView
                draft={draft}
                onDraftChange={setDraft}
                focusSignal={focusSignal}
                onPickTemplate={prefill}
                onSubmit={(input) => submitFromHome(input)}
                onOpenConversation={(id) => navigate({ name: "chat", id })}
                onOpenFolder={(id) => navigate({ name: "folder", id })}
                onCreateFolder={() => setCreatingFolder(true)}
                onShowAllFolders={() => navigate({ name: "folders" })}
                onShowHistory={() => navigate({ name: "history" })}
              />
            )}
            {view.name === "history" && (
              <HistoryView
                onOpenConversation={(id) => navigate({ name: "chat", id })}
                onOpenFolder={(id) => navigate({ name: "folder", id })}
              />
            )}
            {view.name === "folders" && (
              <FoldersView
                onOpenFolder={(id) => navigate({ name: "folder", id })}
                onCreateFolder={() => setCreatingFolder(true)}
              />
            )}
            {view.name === "folder" && (
              <FolderView
                key={view.id}
                folderId={view.id}
                onBack={() => navigate({ name: "folders" })}
                onOpenConversation={(id) => navigate({ name: "chat", id })}
                onSubmit={(input, folderId) => submitFromHome(input, folderId)}
              />
            )}
            {view.name === "feature" && (
              <FeatureView key={view.feature} feature={view.feature} onTry={prefill} />
            )}
            <FooterNote className="px-4 pt-4 pb-6" />
          </div>
        )}
      </main>

      <TextPromptDialog
        open={creatingFolder}
        onOpenChange={setCreatingFolder}
        title="Nouveau dossier"
        description="Regroupez vos conversations par client ou par affaire."
        label="Nom du dossier"
        placeholder="Ex. SAS Durand – cession de fonds"
        confirmLabel="Créer le dossier"
        onConfirm={(name) => {
          const folder = createFolder(name);
          toast.success(`Dossier « ${folder.name} » créé`);
          navigate({ name: "folder", id: folder.id });
        }}
      />
      <OnboardingDialog open={profileState === null} />
      <InfoDialog kind={info} onOpenChange={(open) => !open && setInfo(null)} />
    </div>
  );
}
