"use client";

import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import type { InfoKind } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetProfile } from "@/lib/profile";
import { resetDemo } from "@/lib/store";

interface InfoDialogProps {
  kind: InfoKind | null;
  onOpenChange: (open: boolean) => void;
}

const NEWS = [
  "Réponses en streaming, avec arrêt, copie et régénération",
  "Mode Réflexion pour les analyses approfondies",
  "Option Sources : citation des textes de loi mobilisés",
  "Lecture des PDF, TXT, MD et CSV joints (glisser-déposer)",
  "Dictée vocale en français",
  "Dossiers et historique enregistrés sur cet appareil",
];

const HELP = [
  ["Envoyer", "Entrée (Maj + Entrée pour un saut de ligne)"],
  ["Joindre", "Trombone ou glisser-déposer : 5 fichiers de 8 Mo maximum"],
  ["Modèles", "Chips sous le composer, menu ⚡ ou « Plus »"],
  ["Dossiers", "Rattachez une conversation depuis son en-tête ou son menu « … »"],
  ["Confidentialité", "Rien n'est stocké côté serveur : l'historique reste dans votre navigateur"],
];

export function InfoDialog({ kind, onOpenChange }: InfoDialogProps) {
  return (
    <Dialog open={kind !== null} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        {kind === "news" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-[22px] font-medium">Nouveautés</DialogTitle>
              <DialogDescription>Ce que cette démo sait faire.</DialogDescription>
            </DialogHeader>
            <ul className="grid gap-2.5">
              {NEWS.map((item) => (
                <li key={item} className="flex gap-2.5 text-[14px] text-jm-ink-2">
                  <CheckCircleIcon className="mt-0.5 size-[18px] shrink-0 text-jm-teal" />
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
        {kind === "help" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-[22px] font-medium">Aide</DialogTitle>
              <DialogDescription>
                Jimini vous assiste ; vérifiez toujours les références avant usage.
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-3">
              {HELP.map(([term, detail]) => (
                <div key={term} className="grid gap-0.5">
                  <dt className="text-[13px] font-semibold text-jm-ink">{term}</dt>
                  <dd className="text-[13.5px] text-jm-muted">{detail}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {kind === "settings" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-[22px] font-medium">Paramètres</DialogTitle>
              <DialogDescription>Données de démonstration stockées dans ce navigateur.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-jm-border p-4">
              <div>
                <p className="text-[14px] font-medium text-jm-ink">Réinitialiser la démo</p>
                <p className="text-[13px] text-jm-muted">
                  Restaure les dossiers et conversations d&apos;exemple.
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-xl"
                onClick={() => {
                  resetDemo();
                  toast.success("Démo réinitialisée");
                  onOpenChange(false);
                }}
              >
                <ArrowPathIcon /> Réinitialiser
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-jm-border p-4">
              <div>
                <p className="text-[14px] font-medium text-jm-ink">Revoir l&apos;onboarding</p>
                <p className="text-[13px] text-jm-muted">
                  Rouvre le formulaire de bienvenue et réinitialise votre profil.
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-xl"
                onClick={() => {
                  onOpenChange(false);
                  resetProfile();
                }}
              >
                Rouvrir
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
