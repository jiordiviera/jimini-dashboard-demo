"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { JiminiLogo } from "@/components/jimini-logo";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PROFILE, saveProfile, type UserProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const ORG_TYPES = [
  "Cabinet d'avocats",
  "Direction juridique",
  "Étude notariale",
  "Administration publique",
  "Université / école",
  "Autre",
];

const ROLES = [
  "Associé(e)",
  "Collaborateur / collaboratrice",
  "Juriste",
  "Directeur / directrice juridique",
  "Notaire",
  "Élève avocat / stagiaire",
  "Autre",
];

const SOURCES = [
  "Recherche Google",
  "LinkedIn",
  "Recommandation d'un confrère",
  "Événement ou salon",
  "Presse spécialisée",
  "Autre",
];

const COUNTRIES = [
  { code: "+33", flag: "🇫🇷", label: "France" },
  { code: "+32", flag: "🇧🇪", label: "Belgique" },
  { code: "+41", flag: "🇨🇭", label: "Suisse" },
  { code: "+352", flag: "🇱🇺", label: "Luxembourg" },
  { code: "+1", flag: "🇨🇦", label: "Canada" },
  { code: "+237", flag: "🇨🇲", label: "Cameroun" },
];

const PRACTICE_AREAS = [
  "Droit des affaires",
  "Droit social",
  "Contentieux",
  "Immobilier",
  "Famille & successions",
  "Propriété intellectuelle",
  "Fiscal",
  "Pénal",
  "Droit public",
  "Données & RGPD",
  "Banque & finance",
  "Concurrence",
];

const fieldClass =
  "h-9 w-full rounded-lg border-0 bg-jm-sidebar px-3 text-[13px] text-jm-ink outline-none placeholder:text-jm-placeholder focus-visible:ring-2 focus-visible:ring-jm-blue/30";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[12.5px] font-semibold text-jm-ink">{label}</span>
      {children}
    </div>
  );
}

function ChoiceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const items = [{ value: "", label: "—" }, ...options.map((o) => ({ value: o, label: o }))];
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onChange(typeof next === "string" ? next : "")}
    >
      <SelectTrigger
        aria-label={label}
        className="h-9 w-full rounded-lg border-0 bg-jm-sidebar px-3 text-[13px] text-jm-ink focus-visible:ring-2 focus-visible:ring-jm-blue/30"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="rounded-xl">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OnboardingDialog({ open }: { open: boolean }) {
  const [step, setStep] = useState<0 | 1>(0);
  // Valeurs d'exemple : l'écran reste démonstratif, rien n'est envoyé.
  const [form, setForm] = useState<UserProfile>({
    ...DEFAULT_PROFILE,
    firstName: "Jiordi",
    lastName: "Kengne",
    orgType: "Cabinet d'avocats",
    orgName: "Cabinet Exemple Avocats",
    role: "Collaborateur / collaboratrice",
    phone: "6 12 34 56 78",
    source: "LinkedIn",
    practiceAreas: ["Droit des affaires", "Contentieux"],
  });
  const [country, setCountry] = useState(COUNTRIES[0].code);

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const stepOneValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.orgType !== "" &&
    form.role !== "";

  const toggleArea = (area: string) =>
    set(
      "practiceAreas",
      form.practiceAreas.includes(area)
        ? form.practiceAreas.filter((a) => a !== area)
        : [...form.practiceAreas, area],
    );

  const finish = () => {
    const profile: UserProfile = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      orgName: form.orgName.trim(),
      phone: form.phone.trim() ? `${country} ${form.phone.trim()}` : "",
      completedAt: Date.now(),
    };
    saveProfile(profile);
    toast.success(`Bienvenue ${profile.firstName} !`);
  };

  return (
    <Dialog open={open} disablePointerDismissal>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[20px] p-0 sm:max-w-[468px]"
      >
        <div className="px-6 pt-8 pb-5 sm:px-11">
          <div className="flex flex-col items-center text-center">
            <JiminiLogo className="h-9 text-jm-blue" />
            <DialogTitle className="mt-4 text-[16px] font-medium text-jm-ink">
              {step === 0 ? "Bienvenue sur Jimini" : "Personnalisez votre espace"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-[12.5px] text-jm-ink-3">
              {step === 0
                ? "Avant de commencer, nous avons besoin de quelques informations."
                : "Sélectionnez vos domaines de pratique pour adapter les suggestions."}
            </DialogDescription>
          </div>

          {step === 0 ? (
            <div className="mt-6 grid gap-4">
              <Field label="Nom">
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    aria-label="Prénom"
                    autoComplete="given-name"
                    placeholder="Jiordi"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    aria-label="Nom de famille"
                    autoComplete="family-name"
                    placeholder="Kengne"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </Field>
              <Field label="Type d'organisation">
                <ChoiceSelect
                  label="Type d'organisation"
                  value={form.orgType}
                  options={ORG_TYPES}
                  onChange={(v) => set("orgType", v)}
                />
                <input
                  aria-label="Nom de votre organisation"
                  autoComplete="organization"
                  placeholder="Nom de votre organisation"
                  value={form.orgName}
                  onChange={(e) => set("orgName", e.target.value)}
                  className={cn(fieldClass, "mt-1")}
                />
              </Field>
              <Field label="Rôle">
                <ChoiceSelect
                  label="Rôle"
                  value={form.role}
                  options={ROLES}
                  onChange={(v) => set("role", v)}
                />
              </Field>
              <Field label="Numéro de téléphone">
                <div className="flex h-9 items-center rounded-lg bg-jm-sidebar focus-within:ring-2 focus-within:ring-jm-blue/30">
                  <label className="relative flex h-full shrink-0 items-center gap-1.5 pr-3 pl-3 text-[13px] text-jm-ink">
                    <span aria-hidden>{COUNTRIES.find((c) => c.code === country)?.flag}</span>
                    <span>{country}</span>
                    <select
                      aria-label="Indicatif pays"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.label} ({c.code})
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    aria-label="Numéro de téléphone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="6 12 34 56 78"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value.replace(/[^\d\s]/g, ""))}
                    className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[13px] text-jm-ink outline-none placeholder:text-jm-placeholder"
                  />
                </div>
              </Field>
              <Field label="Comment avez-vous entendu parler de Jimini ?">
                <ChoiceSelect
                  label="Comment avez-vous entendu parler de Jimini ?"
                  value={form.source}
                  options={SOURCES}
                  onChange={(v) => set("source", v)}
                />
              </Field>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {PRACTICE_AREAS.map((area) => {
                const selected = form.practiceAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleArea(area)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
                      selected
                        ? "border-jm-blue bg-jm-soft text-jm-blue"
                        : "border-jm-border bg-white text-jm-ink-2 hover:bg-jm-hover-soft",
                    )}
                  >
                    {selected && <CheckIcon className="size-3.5 stroke-2" />}
                    {area}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 bg-jm-sidebar px-6 py-2.5 text-center text-[11.5px] text-jm-ink-3">
          <InformationCircleIcon className="size-4 shrink-0 text-jm-muted" />
          Écran d&apos;onboarding reproduit, aucune donnée n&apos;est envoyée.
        </p>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-3.5">
          <div>
            {step === 0 && (
              <button
                type="button"
                onClick={() => saveProfile({ ...DEFAULT_PROFILE, completedAt: Date.now() })}
                className="inline-flex h-8 items-center rounded-full border border-jm-border bg-white px-3.5 text-[13px] font-medium text-jm-ink-2 transition-colors hover:border-jm-border-accent hover:bg-jm-hover-soft hover:text-jm-ink"
              >
                Passer
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-jm-ink-3 hover:bg-jm-hover"
              >
                <ArrowLeftIcon className="size-3.5 stroke-2" /> Retour
              </button>
            )}
          </div>
          <div className="flex items-center gap-1" aria-label={`Étape ${step + 1} sur 2`}>
            {[0, 1].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-jm-blue" : "w-6 bg-jm-soft",
                )}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={step === 0 && !stepOneValid}
              onClick={() => (step === 0 ? setStep(1) : finish())}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-jm-ink px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === 0 ? "Suivant" : "Commencer"}
              <ArrowRightIcon className="size-3.5 stroke-2" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
