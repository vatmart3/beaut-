import { NextResponse } from "next/server";
import { site, fullAddress } from "@/config/site";
import { joursDisponibles, isoDate, fromIso } from "@/data/planning";
import { formatDuree, formatPrix } from "@/data/soins";
import { inbox, sendMail } from "@/lib/mail";
import { choixPour, libellePraticienne, reservationSchema, resolvePrestation, type ReservationResponse } from "@/features/reservation/schema";
import { creneauxPour, heureFr, jourLong } from "@/features/reservation/slots";

/** Heure murale de Paris, quel que soit le fuseau du serveur. */
function parisNow(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return new Date(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
}

/** Référence lisible au téléphone : BRM-R-7KQ4 (sans 0/O, 1/I/L). */
function reference() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return `BRM-R-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

const json = (body: ReservationResponse, status = 200) => NextResponse.json(body, { status });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Requête illisible.", code: "validation" }, 400);
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire incomplet.", code: "validation" }, 400);
  }
  const r = parsed.data;

  const presta = resolvePrestation(r.soin, r.variante);
  if (!presta) return json({ ok: false, error: "Ce soin n'existe pas ou plus.", code: "validation" }, 400);
  if (!choixPour(presta.soin).includes(r.praticienne)) {
    return json({ ok: false, error: "Ce soin n'est pas proposé avec cette praticienne.", code: "validation" }, 400);
  }

  // Le créneau existe-t-il encore ? On tolère 30 min de délai entre
  // l'affichage des créneaux et l'envoi du formulaire.
  const now = parisNow();
  const tolerance = new Date(now.getTime() - 30 * 60000);
  const horizon = joursDisponibles(tolerance).map(isoDate);
  const libres = horizon.includes(r.date) ? creneauxPour(r.date, presta.duree, r.praticienne, tolerance) : [];
  const creneau = libres.find((c) => c.heure === r.heure);
  if (!creneau) {
    return json(
      { ok: false, error: "Ce créneau vient d'être pris ou n'est plus réservable. Choisissez-en un autre, il en reste d'autres.", code: "creneau" },
      409,
    );
  }

  const ref = reference();
  const jour = `${jourLong(fromIso(r.date))} à ${heureFr(r.heure)}`;
  const praticienne = libellePraticienne(r.praticienne, creneau.praticienne);
  const s = r.sante;
  const signalements = [
    s.grossesse && "Grossesse en cours",
    s.allergies && `Allergies connues${s.allergiesDetail ? ` : ${s.allergiesDetail}` : ""}`,
    s.traitement && "Traitement dermatologique en cours",
    s.circulation && "Problème circulatoire",
  ].filter(Boolean) as string[];

  const institut = await sendMail({
    to: inbox(),
    replyTo: r.email,
    subject: `Demande de rendez-vous ${ref} — ${presta.label}, ${jour}`,
    text: [
      `Nouvelle demande de rendez-vous (${ref})`,
      "",
      `Soin : ${presta.label}${presta.personnes === 2 ? " (pour deux personnes)" : ""}`,
      `Durée : ${formatDuree(presta.duree)} · Prix : ${formatPrix(presta.prix)}`,
      `Praticienne : ${praticienne}`,
      `Date : ${jour}`,
      "",
      `Cliente : ${r.prenom} ${r.nom}`,
      `Téléphone : ${r.telephone}`,
      `E-mail : ${r.email}`,
      "",
      "Questionnaire santé :",
      signalements.length ? signalements.map((x) => `— ${x}`).join("\n") : "— Rien de signalé",
      "",
      "Ces informations de santé servent uniquement à adapter le soin : supprimez cet e-mail une fois le rendez-vous passé.",
      `Conditions d'annulation acceptées : ${site.policies.cancellation}`,
    ].join("\n"),
  });

  if (!institut.ok) {
    console.error("[reservation] envoi institut", institut.error);
    return json({ ok: false, error: `L'envoi a échoué. Appelez-nous au ${site.contact.phone}, nous réservons avec vous.`, code: "envoi" }, 500);
  }

  // Confirmation à la cliente — sans les données de santé (minimisation).
  const client = await sendMail({
    to: r.email,
    replyTo: site.contact.email,
    subject: `${site.name} — votre demande de rendez-vous ${ref}`,
    text: [
      `Bonjour ${r.prenom},`,
      "",
      `Nous avons bien reçu votre demande. Nous vous la confirmons par SMS ou par e-mail ${site.contact.responseTime}.`,
      "",
      `${presta.label} — ${formatDuree(presta.duree)}, ${formatPrix(presta.prix)}`,
      `${jour}, avec ${praticienne.toLowerCase().startsWith("peu importe") ? "la praticienne disponible" : praticienne}`,
      `Référence : ${ref}`,
      "",
      `Adresse : ${site.fullName}, ${fullAddress}`,
      presta.soin.avant.length ? `Avant votre soin : ${presta.soin.avant.join(" ")}` : "",
      "",
      `${site.policies.cancellation} Un appel au ${site.contact.phone} suffit.`,
      site.policies.payment,
      "",
      `À bientôt,\n${site.name}`,
    ]
      .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
      .join("\n"),
  });
  if (!client.ok) console.error("[reservation] envoi cliente", client.error);

  return json({ ok: true, demo: institut.demo, reference: ref });
}
