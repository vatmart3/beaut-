/** BRUME — bons cadeaux : motifs, montants suggérés, occasions. */

export type MotifId = "galets" | "brume" | "argile";

export const motifs: { id: MotifId; label: string; description: string; fond: string; encre: string; accent: string }[] = [
  { id: "galets", label: "Galets", description: "Trois galets posés, fond sable", fond: "#EFE6DF", encre: "#221B1D", accent: "#D4A78F" },
  { id: "brume", label: "Brume", description: "Onde concentrique, fond sauge", fond: "#9CAF9A", encre: "#23191F", accent: "#F8F5F2" },
  { id: "argile", label: "Argile", description: "Texture d'argile, fond prune", fond: "#221B1D", encre: "#F8F5F2", accent: "#D4A78F" },
];

export const montantsSuggeres = [50, 80, 120, 150];

/**
 * Occasions : le bon cadeau est mis en avant automatiquement pendant la
 * fenêtre `avantJours` qui précède chaque date (calcul sur la date réelle).
 */
export interface Occasion {
  id: "saint-valentin" | "fete-des-meres" | "noel";
  label: string;
  avantJours: number;
  phrase: string;
  date: (annee: number) => Date;
}

/** Dimanche de Pâques (algorithme de Meeus/Jones/Butcher). */
function paques(y: number) {
  const a = y % 19,
    b = Math.floor(y / 100),
    c = y % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31),
    day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

/** Fête des mères en France : dernier dimanche de mai, décalée au 1er dimanche de juin si c'est la Pentecôte. */
function feteDesMeres(y: number) {
  const d = new Date(y, 4, 31);
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
  const pentecote = paques(y);
  pentecote.setDate(pentecote.getDate() + 49);
  if (d.getTime() === pentecote.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

export const occasions: Occasion[] = [
  { id: "saint-valentin", label: "Saint-Valentin", avantJours: 25, phrase: "Un duo pour la Saint-Valentin", date: (y) => new Date(y, 1, 14) },
  { id: "fete-des-meres", label: "Fête des mères", avantJours: 25, phrase: "Pour la fête des mères", date: feteDesMeres },
  { id: "noel", label: "Noël", avantJours: 40, phrase: "À glisser sous le sapin", date: (y) => new Date(y, 11, 24) },
];

/** Occasion en cours (dans sa fenêtre) ou prochaine occasion, avec le nombre de jours restants. */
export function occasionDuMoment(now = new Date()) {
  const jour = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const futures = occasions
    .flatMap((o) => [now.getFullYear(), now.getFullYear() + 1].map((y) => ({ o, date: o.date(y) })))
    .filter(({ date }) => date.getTime() >= jour.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const prochaine = futures[0];
  const jours = Math.round((prochaine.date.getTime() - jour.getTime()) / 86400000);
  return { ...prochaine, jours, active: jours <= prochaine.o.avantJours };
}

/** Code unique lisible (sans 0/O/1/I). */
export function genererCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `BRM-${chars.slice(0, 4)}-${chars.slice(4)}`;
}
