import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { inbox, sendMail } from "@/lib/mail";
import { contactSchema, SUJETS, type ContactResponse } from "@/features/contenu/infos/contact-schema";

const json = (body: ContactResponse, status = 200) => NextResponse.json(body, { status });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Requête illisible." }, 400);
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire incomplet." }, 400);
  const m = parsed.data;
  const sujet = SUJETS.find((s) => s.id === m.sujet)?.label ?? m.sujet;

  const sent = await sendMail({
    to: inbox(),
    replyTo: m.email,
    subject: `Message du site — ${sujet} — ${m.nom}`,
    text: [`De : ${m.nom} <${m.email}>`, m.telephone ? `Téléphone : ${m.telephone}` : "", `Sujet : ${sujet}`, "", m.message]
      .filter((l, i) => l !== "" || i > 2)
      .join("\n"),
  });
  if (!sent.ok) {
    console.error("[contact]", sent.error);
    return json({ ok: false, error: `L'envoi a échoué. Écrivez-nous à ${site.contact.email} ou appelez le ${site.contact.phone}.` }, 500);
  }

  const ack = await sendMail({
    to: m.email,
    replyTo: site.contact.email,
    subject: `${site.name} — nous avons bien reçu votre message`,
    text: [
      "Bonjour,",
      "",
      `Merci pour votre message. Nous vous répondons ${site.contact.responseTime}.`,
      `Pour une question urgente, appelez-nous au ${site.contact.phone} aux heures d'ouverture.`,
      "",
      site.name,
    ].join("\n"),
  });
  if (!ack.ok) console.error("[contact] accusé", ack.error);

  return json({ ok: true, demo: sent.demo });
}
