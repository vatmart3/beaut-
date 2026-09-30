/** Formulaire de contact — schéma partagé client ↔ POST /api/contact. */
import { z } from "zod";

export const SUJETS = [
  { id: "soin", label: "Un soin" },
  { id: "rendez-vous", label: "Un rendez-vous" },
  { id: "cadeau", label: "Un bon cadeau" },
  { id: "autre", label: "Autre chose" },
] as const;

export const contactSchema = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom.").max(80, "80 caractères maximum."),
  email: z.string().trim().min(1, "Indiquez votre e-mail.").pipe(z.email("Cette adresse e-mail ne semble pas valide.")),
  telephone: z
    .string()
    .trim()
    .max(20, "20 caractères maximum.")
    .refine((v) => v === "" || /^(?:\+\d{8,15}|0\d{9})$/.test(v.replace(/[\s.()-]/g, "")), "Ce numéro ne semble pas complet."),
  sujet: z.enum(["soin", "rendez-vous", "cadeau", "autre"], { message: "Choisissez un sujet." }),
  message: z.string().trim().min(10, "Quelques mots de plus : 10 caractères minimum.").max(2000, "2 000 caractères maximum."),
  /** Pot de miel anti-robots. */
  site: z.string().max(0),
});

export type ContactValues = z.infer<typeof contactSchema>;
export type ContactResponse = { ok: true; demo: boolean } | { ok: false; error: string };
