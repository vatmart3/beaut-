import { creneaux, isoDate, joursDisponibles, fromIso, type Creneau } from "@/data/planning";
import { getPraticienne } from "@/data/praticiennes";
import { argsCreneaux, type ChoixPraticienne } from "./schema";

/**
 * Créneaux pour un choix de praticienne, en tenant compte de ses jours de
 * présence (le planning ne le fait que pour « indifférent » et le duo).
 */
export function creneauxPour(iso: string, duree: number, choix: ChoixPraticienne, now: Date): Creneau[] {
  if (choix === "clemence" || choix === "ines") {
    const p = getPraticienne(choix);
    if (p && !p.jours.includes(fromIso(iso).getDay())) return [];
  }
  const { praticienne, personnes } = argsCreneaux(choix);
  return creneaux(iso, duree, praticienne, personnes, now);
}

export interface JourDispo {
  iso: string;
  date: Date;
  creneaux: Creneau[];
}

/** Les jours ouverts de l'horizon, avec leurs créneaux calculés. */
export function calendrier(duree: number, choix: ChoixPraticienne, now: Date): JourDispo[] {
  return joursDisponibles(now).map((d) => {
    const iso = isoDate(d);
    return { iso, date: d, creneaux: creneauxPour(iso, duree, choix, now) };
  });
}

/** Premier créneau disponible (pour « dès mardi 6 oct., 9 h 30 »). */
export function premierCreneau(duree: number, choix: ChoixPraticienne, now: Date) {
  for (const d of joursDisponibles(now)) {
    const iso = isoDate(d);
    const c = creneauxPour(iso, duree, choix, now);
    if (c.length) return { date: d, iso, heure: c[0].heure };
  }
  return null;
}

/** "09:30" → "9 h 30" */
export const heureFr = (hhmm: string) => {
  const [h, m] = hhmm.split(":");
  return `${Number(h)} h${m === "00" ? "" : ` ${m}`}`;
};

export const jourCourt = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
export const jourLong = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
