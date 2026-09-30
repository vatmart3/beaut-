import "server-only";
import { site } from "@/config/site";

/**
 * Envoi d'e-mails via Resend si `RESEND_API_KEY` est définie.
 * Sinon : mode démo — le contenu est journalisé et l'appel réussit.
 */
export async function sendMail({
  to,
  subject,
  text,
  replyTo,
  scheduledAt,
}: {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
  /** ISO 8601 — envoi programmé (Resend accepte jusqu'à 30 jours). */
  scheduledAt?: string;
}): Promise<{ ok: true; demo: boolean; id?: string } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? `${site.name} <onboarding@resend.dev>`;
  if (!key) {
    // Démo : on ne journalise jamais le corps (il peut contenir des données de santé).
    console.info("[mail:démo]", JSON.stringify({ to, subject, scheduledAt, length: text.length }));
    return { ok: true, demo: true };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({ from, to, subject, text, replyTo, scheduledAt });
    if (error) return { ok: false, error: error.message };
    return { ok: true, demo: false, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur d'envoi" };
  }
}

/** Adresse qui reçoit les demandes (réservations, bons cadeaux, contact). */
export const inbox = () => process.env.MAIL_TO ?? site.contact.email;
