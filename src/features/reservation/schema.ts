/**
 * Réservation — schéma partagé client ↔ serveur (POST /api/reservation).
 * Aucune dépendance serveur : importable dans les composants client.
 */
import { z } from "zod";
import { getSoin, type Soin } from "@/data/soins";
import { getPraticienne } from "@/data/praticiennes";

export const PRATICIENNES = ["clemence", "ines", "indifferent", "duo"] as const;
export type ChoixPraticienne = (typeof PRATICIENNES)[number];

const tel = /^(?:\+\d{8,15}|0\d{9})$/;
const cleanTel = (v: string) => v.replace(/[\s.()-]/g, "");

/** Étape 4 — coordonnées, questionnaire santé, consentement. */
export const coordonneesSchema = z.object({
  prenom: z.string().trim().min(1, "Indiquez votre prénom.").max(60, "60 caractères maximum."),
  nom: z.string().trim().min(1, "Indiquez votre nom.").max(80, "80 caractères maximum."),
  telephone: z
    .string()
    .trim()
    .min(1, "Un numéro nous permet de vous confirmer le rendez-vous par SMS.")
    .refine((v) => tel.test(cleanTel(v)), "Ce numéro ne semble pas complet (ex. 06 12 34 56 78)."),
  email: z.string().trim().min(1, "Indiquez votre e-mail.").pipe(z.email("Cette adresse e-mail ne semble pas valide.")),
  sante: z.object({
    grossesse: z.boolean(),
    allergies: z.boolean(),
    allergiesDetail: z.string().trim().max(200, "200 caractères maximum."),
    traitement: z.boolean(),
    circulation: z.boolean(),
  }),
  annulation: z.boolean().refine((v) => v, "Merci de confirmer avoir lu les conditions d'annulation."),
  /** Pot de miel anti-robots : doit rester vide. */
  site: z.string().max(0),
});

/** Étapes 1 à 3 — la sélection. */
export const selectionSchema = z.object({
  soin: z.string().min(1).max(80),
  variante: z.number().int().min(0).max(20).nullable(),
  praticienne: z.enum(PRATICIENNES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  heure: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide."),
});

export const reservationSchema = selectionSchema.extend(coordonneesSchema.shape);

export type Coordonnees = z.infer<typeof coordonneesSchema>;
export type Selection = z.infer<typeof selectionSchema>;
export type ReservationPayload = z.infer<typeof reservationSchema>;

export type ReservationResponse = { ok: true; demo: boolean; reference: string } | { ok: false; error: string; code?: "creneau" | "validation" | "envoi" };

export const coordonneesDefaults: Coordonnees = {
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  sante: { grossesse: false, allergies: false, allergiesDetail: "", traitement: false, circulation: false },
  annulation: false,
  site: "",
};

export interface Prestation {
  soin: Soin;
  variante: number | null;
  label: string;
  duree: number;
  prix: number;
  personnes: 1 | 2;
}

/** Soin + variante → durée, prix, libellé. `null` si incohérent. */
export function resolvePrestation(slug: string | undefined, variante: number | null | undefined): Prestation | null {
  if (!slug) return null;
  const soin = getSoin(slug);
  if (!soin) return null;
  const personnes = soin.personnes ?? 1;
  if (soin.variantes?.length) {
    const i = variante ?? -1;
    const v = soin.variantes[i];
    if (!v) return null;
    return { soin, variante: i, label: v.label === soin.nom ? soin.nom : `${soin.nom} — ${v.label}`, duree: v.duree, prix: v.prix, personnes };
  }
  return { soin, variante: null, label: soin.nom, duree: soin.duree, prix: soin.prix, personnes };
}

/** Choix de praticienne proposés pour un soin. */
export function choixPour(soin: Soin): ChoixPraticienne[] {
  if ((soin.personnes ?? 1) === 2) return ["duo"];
  const ids = soin.praticiennes.filter((id): id is "clemence" | "ines" => id === "clemence" || id === "ines");
  return ids.length > 1 ? ["indifferent", ...ids] : ids;
}

/** Libellé humain d'un choix de praticienne. */
export function libellePraticienne(choix: ChoixPraticienne | undefined, attribuee?: string) {
  if (!choix) return "";
  if (choix === "duo") return "Clémence et Inès, ensemble";
  if (choix === "indifferent") {
    const p = attribuee ? getPraticienne(attribuee) : undefined;
    return p ? `Peu importe — ${p.prenom} est disponible` : "Peu importe";
  }
  const p = getPraticienne(choix);
  return p ? `${p.prenom} ${p.nom}` : choix;
}

/** Arguments `creneaux()` pour un choix donné. */
export function argsCreneaux(choix: ChoixPraticienne): { praticienne: string; personnes: 1 | 2 } {
  if (choix === "duo") return { praticienne: "indifferent", personnes: 2 };
  return { praticienne: choix, personnes: 1 };
}
