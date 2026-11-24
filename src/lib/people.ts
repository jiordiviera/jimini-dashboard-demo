/** Photo de l'utilisateur (profil GitHub public de Jiordi Kengne). */
export const USER_AVATAR_URL = "https://github.com/jiordiviera.png?size=96";

const pravatar = (id: number) => `https://i.pravatar.cc/96?img=${id}`;

/** Collaborateurs fictifs de la démo, identifiés par leurs initiales. */
export const PEOPLE: Record<string, { name: string; avatar: string }> = {
  JK: { name: "Jiordi Kengne", avatar: USER_AVATAR_URL },
  TB: { name: "Thomas Bernard", avatar: pravatar(12) },
  AR: { name: "Amélie Roux", avatar: pravatar(47) },
  CD: { name: "Claire Dubois", avatar: pravatar(45) },
  PG: { name: "Paul Garnier", avatar: pravatar(59) },
  SB: { name: "Sophie Blanc", avatar: pravatar(44) },
  JV: { name: "Julien Vernet", avatar: pravatar(53) },
  EL: { name: "Émilie Leblanc", avatar: pravatar(32) },
};

export function avatarFor(initials: string): string | undefined {
  return PEOPLE[initials]?.avatar;
}

export function nameFor(initials: string): string {
  return PEOPLE[initials]?.name ?? initials;
}
