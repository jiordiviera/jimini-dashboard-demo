"use client";

import { useSyncExternalStore } from "react";

const PROFILE_KEY = "jimini-demo-profile";

export interface UserProfile {
  firstName: string;
  lastName: string;
  orgType: string;
  orgName: string;
  role: string;
  phone: string;
  source: string;
  practiceAreas: string[];
  emailTracking: boolean;
  completedAt: number;
}

export const DEFAULT_PROFILE: UserProfile = {
  firstName: "Jiordi",
  lastName: "Kengne",
  orgType: "",
  orgName: "",
  role: "",
  phone: "",
  source: "",
  practiceAreas: [],
  emailTracking: false,
  completedAt: 0,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: UserProfile | null | undefined;

function read(): UserProfile | null {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (typeof parsed.firstName !== "string") return null;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return null;
  }
}

function getSnapshot(): UserProfile | null {
  if (cache === undefined) cache = read();
  return cache;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(next: UserProfile | null): void {
  cache = next;
  listeners.forEach((l) => l());
}

/** `undefined` côté serveur (inconnu), `null` si l'onboarding n'a pas été fait. */
export function useProfileState(): UserProfile | null | undefined {
  return useSyncExternalStore<UserProfile | null | undefined>(
    subscribe,
    getSnapshot,
    () => undefined,
  );
}

export function useProfile(): UserProfile {
  return useProfileState() ?? DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // stockage indisponible : le profil reste en mémoire
  }
  emit(profile);
}

export function resetProfile(): void {
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
  emit(null);
}

export function initialsOf(profile: Pick<UserProfile, "firstName" | "lastName">): string {
  const value = `${profile.firstName.trim().charAt(0)}${profile.lastName.trim().charAt(0)}`;
  return value.toUpperCase() || "JK";
}

export function displayName(profile: Pick<UserProfile, "firstName" | "lastName">): string {
  return `${profile.firstName} ${profile.lastName}`.trim() || "Jiordi Kengne";
}
