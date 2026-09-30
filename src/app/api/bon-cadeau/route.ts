import { z } from "zod";
import { fullAddress, site, siteUrl } from "@/config/site";
import { inbox, sendMail } from "@/lib/mail";
import {
  ENVOI_MAX_JOURS,
  formatDateLong,
  giftSchema,
  libelleValeur,
  motifDe,
  parisNineAm,
  parisTodayKey,
  validiteKey,
  valeurDuBon,
} from "@/features/bons-cadeaux/model";

/**
 * Demande de bon cadeau.
 * Aucun paiement en ligne : l'institut reçoit la demande à encaisser, l'acheteur
 * une confirmation, et — si choisi — le destinataire reçoit son bon par e-mail
 * à 9 h (heure de Paris) le jour choisi (envoi programmé Resend).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Requête illisible." }, { status: 400 });
  }

  const parsed = giftSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Certaines informations sont incomplètes ou invalides.", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Champ piège rempli : on répond comme si tout allait bien, sans rien envoyer.
  if (d.website) return Response.json({ ok: true, demo: true });

  const valeur = valeurDuBon(d);
  const today = parisTodayKey();
  const validite = formatDateLong(validiteKey(today), { weekday: false });
  const libelle = libelleValeur(valeur);
  const motif = motifDe(d.motif).label;
  const prix = valeur.prix !== null ? `${valeur.prix} €` : "à confirmer";

  // Envoi programmé : 9 h heure de Paris, borné à la fenêtre acceptée par le service d'envoi.
  let scheduledAt: string | undefined;
  let envoiLabel = "";
  if (d.remise === "email") {
    const at = parisNineAm(d.dateEnvoi);
    const now = Date.now();
    const max = now + ENVOI_MAX_JOURS * 86_400_000 - 10 * 60_000;
    if (at.getTime() > now + 60_000) scheduledAt = new Date(Math.min(at.getTime(), max)).toISOString();
    envoiLabel = scheduledAt ? `le ${formatDateLong(d.dateEnvoi, { year: false })} à 9 h` : "dès maintenant";
  }

  const lignesBon = [
    `Code : ${d.code}`,
    `Valeur : ${libelle}`,
    `Montant à régler : ${prix} TTC`,
    `Valable jusqu'au ${validite}`,
    `Pour : ${d.pour}`,
    `De la part de : ${d.de}`,
    `Motif de carte : ${motif}`,
    d.message ? `Message : « ${d.message.trim()} »` : "Message : (aucun)",
  ];

  const pourInstitut = await sendMail({
    to: inbox(),
    replyTo: d.emailAcheteur,
    subject: `Bon cadeau à encaisser — ${d.code} — ${prix}`,
    text: [
      "Nouvelle demande de bon cadeau (paiement à encaisser, aucun règlement en ligne).",
      "",
      ...lignesBon,
      "",
      "Acheteur",
      `E-mail : ${d.emailAcheteur}`,
      `Téléphone : ${d.telephone}`,
      "",
      "Remise",
      d.remise === "pdf"
        ? "PDF téléchargé par l'acheteur (à imprimer)."
        : `Par e-mail à ${d.emailDestinataire}, ${envoiLabel}.${scheduledAt ? " Si le règlement n'a pas eu lieu d'ici là, annulez l'envoi programmé dans le tableau de bord d'envoi." : ""}`,
      "",
      `À faire : appeler l'acheteur ${site.contact.responseTime} pour le règlement, puis activer le code.`,
    ].join("\n"),
  });

  if (!pourInstitut.ok) {
    return Response.json(
      { ok: false, error: `La demande n'a pas pu être transmise. Réessayez dans un instant ou appelez-nous au ${site.contact.phone}.` },
      { status: 500 },
    );
  }

  const envois: Promise<Awaited<ReturnType<typeof sendMail>>>[] = [
    sendMail({
      to: d.emailAcheteur,
      replyTo: inbox(),
      subject: `Votre bon cadeau ${site.name} — ${d.code}`,
      text: [
        `Bonjour ${d.de},`,
        "",
        `Merci : le bon cadeau pour ${d.pour} est réservé à votre nom.`,
        "",
        ...lignesBon,
        "",
        "Règlement",
        `Le bon est activé après règlement : nous vous appelons ${site.contact.responseTime} au ${d.telephone}, ou vous pouvez le régler directement à l'institut (${fullAddress}).`,
        "",
        d.remise === "pdf"
          ? "Vous avez téléchargé le bon en PDF : imprimez-le et glissez-le dans une enveloppe. Nous pouvons aussi vous remettre une enveloppe en papier ensemencé à l'institut."
          : `Le bon sera envoyé à ${d.emailDestinataire} ${envoiLabel}.`,
        "",
        `Conditions générales de vente des bons cadeaux : ${siteUrl}/cgv-bons-cadeaux`,
        "",
        `${site.fullName}`,
        `${fullAddress} · ${site.contact.phone}`,
      ].join("\n"),
    }),
  ];

  if (d.remise === "email") {
    envois.push(
      sendMail({
        to: d.emailDestinataire,
        replyTo: inbox(),
        scheduledAt,
        subject: `${d.de} vous offre un moment chez ${site.name}`,
        text: [
          `Bonjour ${d.pour},`,
          "",
          `${d.de} vous offre un bon cadeau ${site.name} : ${libelle}.`,
          ...(d.message.trim() ? ["", `« ${d.message.trim()} »`] : []),
          "",
          `Code du bon : ${d.code}`,
          `Valable jusqu'au ${validite}.`,
          "",
          `Pour réserver : ${siteUrl}/reserver ou par téléphone au ${site.contact.phone}. Indiquez simplement votre code.`,
          `L'institut : ${fullAddress}. ${site.hoursNote}`,
          "",
          "À très vite,",
          site.fullName,
        ].join("\n"),
      }),
    );
  }

  const [confirmation, destinataire] = await Promise.all(envois);
  if (!confirmation.ok) console.error("[bon-cadeau] confirmation acheteur :", confirmation.error);
  if (destinataire && !destinataire.ok) {
    return Response.json(
      {
        ok: false,
        error: `Votre bon est bien réservé, mais l'envoi programmé au destinataire a échoué. Appelez-nous au ${site.contact.phone} : nous l'enverrons nous-mêmes.`,
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, demo: pourInstitut.demo, scheduledAt: scheduledAt ?? null });
}
