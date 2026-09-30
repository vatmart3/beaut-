/**
 * BRUME — planning des praticiennes.
 *
 * En démonstration, les créneaux déjà pris sont simulés de façon
 * déterministe (même date = mêmes créneaux pris pour tout le monde).
 * Pour un vrai client, remplacez `estPris()` par un appel à l'outil de
 * réservation (Planity, Kalendes, Google Agenda…) ou à une base de données.
 */
import { site, type DayKey } from "@/config/site";
import { praticiennes } from "./praticiennes";

/** Pas de la grille, en minutes. */
export const PAS = 30;

/** Pause déjeuner (aucun soin ne la chevauche). */
export const PAUSE = { debut: "13:00", fin: "14:00" };

/** Fermetures exceptionnelles (AAAA-MM-JJ). */
export const fermetures: string[] = ["2026-11-11", "2026-12-25", "2026-12-26", "2027-01-01"];

/** Nombre de jours ouverts proposés à la réservation. */
export const HORIZON_JOURS = 21;

const dayKeys: DayKey[] = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Simule l'occupation : ~45 % des créneaux sont pris, par blocs. */
function estPris(iso: string, praticienne: string, minute: number) {
  const bloc = Math.floor(minute / 60);
  return hash(`${iso}|${praticienne}|${bloc}`) % 100 < 45;
}

export function horairesDuJour(d: Date) {
  const key = dayKeys[d.getDay()];
  return site.hours.find((h) => h.day === key)?.ranges ?? [];
}

export function estOuvert(d: Date) {
  return horairesDuJour(d).length > 0 && !fermetures.includes(isoDate(d));
}

/** Prochains jours ouverts à partir d'aujourd'hui (inclus si ouvert). */
export function joursDisponibles(now = new Date(), nombre = HORIZON_JOURS) {
  const jours: Date[] = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let garde = 0;
  while (jours.length < nombre && garde < 90) {
    if (estOuvert(d)) jours.push(new Date(d));
    d.setDate(d.getDate() + 1);
    garde++;
  }
  return jours;
}

export interface Creneau {
  heure: string;
  praticienne: string;
}

/**
 * Créneaux où un soin de `duree` minutes peut commencer.
 * `praticienne` = id, ou "indifferent" pour fusionner les deux plannings.
 * `personnes` = 2 pour un soin duo (les deux praticiennes libres en même temps).
 */
export function creneaux(
  iso: string,
  duree: number,
  praticienne: string | "indifferent" = "indifferent",
  personnes: 1 | 2 = 1,
  now = new Date(),
): Creneau[] {
  const d = fromIso(iso);
  if (!estOuvert(d)) return [];
  const ranges = horairesDuJour(d);
  const pause = { d: toMin(PAUSE.debut), f: toMin(PAUSE.fin) };
  const estAujourdhui = isoDate(now) === iso;
  // Délai minimal de 2 h pour réserver le jour même.
  const minDebut = estAujourdhui ? now.getHours() * 60 + now.getMinutes() + 120 : 0;

  const ids =
    personnes === 2 || praticienne === "indifferent"
      ? praticiennes.filter((p) => p.jours.includes(d.getDay())).map((p) => p.id)
      : [praticienne];

  const libre = (id: string, debut: number) => {
    for (let m = debut; m < debut + duree; m += PAS) {
      if (estPris(iso, id, m)) return false;
    }
    return true;
  };

  const out: Creneau[] = [];
  for (const r of ranges) {
    const o = toMin(r.opens);
    const c = toMin(r.closes);
    for (let m = o; m + duree <= c; m += PAS) {
      if (m < minDebut) continue;
      const chevauchePause = m < pause.f && m + duree > pause.d;
      if (chevauchePause) continue;
      if (personnes === 2) {
        if (ids.length >= 2 && ids.every((id) => libre(id, m))) out.push({ heure: toHHMM(m), praticienne: "duo" });
        continue;
      }
      const dispo = ids.find((id) => libre(id, m));
      if (dispo) out.push({ heure: toHHMM(m), praticienne: dispo });
    }
  }
  return out;
}

/** Créneaux d'une heure encore libres sur les 7 prochains jours (rareté réelle). */
export function creneauxRestantsSemaine(now = new Date()) {
  const jours = joursDisponibles(now, 7).filter((d) => d.getTime() - now.getTime() < 7 * 86400000);
  return jours.reduce((acc, d) => acc + creneaux(isoDate(d), 60, "indifferent", 1, now).length, 0);
}

export function formatJour(d: Date, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  return d.toLocaleDateString("fr-FR", opts);
}
