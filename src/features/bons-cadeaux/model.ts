/**
 * Bons cadeaux — modèle partagé client / serveur :
 * schéma zod du formulaire, calcul de la valeur du bon, dates (heure de Paris).
 * Aucun import navigateur ni serveur ici : ce module est utilisé des deux côtés.
 */
import { z } from "zod";
import { site } from "@/config/site";
import { motifs, type MotifId } from "@/data/bons-cadeaux";
import { formatDuree, formatPrix, getSoin, type Soin } from "@/data/soins";

const { giftMin, giftMax, giftValidityMonths } = site.policies;

export const MESSAGE_MAX = 240;
export const ENVOI_MAX_JOURS = 30;
const TZ = "Europe/Paris";

/* ——————————————————————————————————————————————— Dates (Paris) */

/** Date du jour à Paris, au format AAAA-MM-JJ. */
export function parisTodayKey(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** AAAA-MM-JJ → Date locale à minuit (pour les calculs de calendrier et l'affichage). */
export function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysKey(key: string, n: number) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** Date de fin de validité : date d'achat + N mois (fin de mois conservée). */
export function validiteKey(todayKey: string) {
  const d = fromKey(todayKey);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + giftValidityMonths, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, last));
  return toKey(target);
}

/** « jeudi 24 décembre 2026 » (ou sans l'année). */
export function formatDateLong(key: string, { weekday = true, year = true }: { weekday?: boolean; year?: boolean } = {}) {
  return fromKey(key).toLocaleDateString("fr-FR", {
    weekday: weekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: year ? "numeric" : undefined,
  });
}

/** Décalage (minutes) de Paris par rapport à UTC à un instant donné. */
function parisOffsetMinutes(at: Date) {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = part?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 60;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

/** Instant UTC correspondant à 9 h 00, heure de Paris, le jour donné. */
export function parisNineAm(key: string) {
  const [y, mo, d] = key.split("-").map(Number);
  const guess = Date.UTC(y, mo - 1, d, 9, 0, 0);
  return new Date(guess - parisOffsetMinutes(new Date(guess)) * 60_000);
}

/* ——————————————————————————————————————————————— Schéma */

const codeRe = /^BRM-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
const phoneRe = /^[+()\d][\d\s().-]{8,19}$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

const conditionnels = ["type", "montant", "soin", "variante", "remise", "emailDestinataire", "dateEnvoi"];

export const giftSchema = z
  .object({
    type: z.enum(["montant", "soin"]),
    /** Saisi en texte (champ libre + pastilles), converti à la validation. */
    montant: z.string().trim(),
    soin: z.string(),
    variante: z.string(),
    de: z.string().trim().min(2, "Indiquez votre prénom (2 caractères minimum).").max(60, "60 caractères maximum."),
    pour: z.string().trim().min(2, "Indiquez le prénom de la personne qui reçoit le bon.").max(60, "60 caractères maximum."),
    message: z.string().max(MESSAGE_MAX, `Le message est limité à ${MESSAGE_MAX} caractères.`),
    motif: z.enum(["galets", "brume", "argile"]),
    remise: z.enum(["pdf", "email"]),
    emailDestinataire: z.string().trim(),
    dateEnvoi: z.string(),
    emailAcheteur: z.email({ error: "Cette adresse e-mail ne semble pas valide." }),
    telephone: z.string().trim().regex(phoneRe, "Indiquez un numéro de téléphone joignable (10 chiffres)."),
    cgv: z.boolean().refine((v) => v, "Merci de lire et d'accepter les conditions de vente des bons cadeaux."),
    code: z.string().regex(codeRe, "Code du bon invalide : rechargez la page."),
    /** Champ piège anti-robots, laissé vide par les humains. */
    website: z.string().max(200),
  })
  .superRefine((d, ctx) => {
    if (d.type === "montant") {
      const n = Number(d.montant.replace(",", "."));
      if (!d.montant) ctx.addIssue({ code: "custom", path: ["montant"], message: "Choisissez un montant ou saisissez-le." });
      else if (!Number.isInteger(n)) ctx.addIssue({ code: "custom", path: ["montant"], message: "Indiquez un montant en euros, sans centimes." });
      else if (n < giftMin || n > giftMax)
        ctx.addIssue({ code: "custom", path: ["montant"], message: `Le montant doit être compris entre ${giftMin} et ${giftMax} €.` });
    } else {
      const s = getSoin(d.soin);
      if (!s) ctx.addIssue({ code: "custom", path: ["soin"], message: "Choisissez le soin à offrir." });
      else if (s.variantes && !s.variantes.some((v) => v.label === d.variante))
        ctx.addIssue({ code: "custom", path: ["variante"], message: "Choisissez la formule du soin." });
    }
    if (d.remise === "email") {
      if (!z.email().safeParse(d.emailDestinataire).success)
        ctx.addIssue({ code: "custom", path: ["emailDestinataire"], message: "Indiquez l'adresse e-mail de la personne qui reçoit le bon." });
      const today = parisTodayKey();
      // Tolérance d'un jour : le navigateur et le serveur peuvent être de part et d'autre de minuit.
      const min = addDaysKey(today, -1);
      const max = addDaysKey(today, ENVOI_MAX_JOURS);
      if (!dateRe.test(d.dateEnvoi)) ctx.addIssue({ code: "custom", path: ["dateEnvoi"], message: "Choisissez la date d'envoi." });
      else if (d.dateEnvoi < min || d.dateEnvoi > max)
        ctx.addIssue({ code: "custom", path: ["dateEnvoi"], message: `La date d'envoi doit se situer dans les ${ENVOI_MAX_JOURS} prochains jours.` });
    }
  }, {
    // Vérifie aussi ces champs quand d'autres sont invalides : toutes les erreurs s'affichent d'un coup.
    when: (payload) => {
      const v = payload.value as Record<string, unknown> | null;
      return !!v && typeof v === "object" && conditionnels.every((k) => typeof v[k] === "string");
    },
  });

export type GiftInput = z.input<typeof giftSchema>;
export type GiftValues = z.output<typeof giftSchema>;

/* ——————————————————————————————————————————————— Valeur du bon */

export interface Valeur {
  /** Montant TTC en euros, ou null si incomplet. */
  prix: number | null;
  /** Ligne principale : « 80 € » ou nom du soin. */
  titre: string;
  /** Précision : formule, durée, nombre de personnes. */
  detail: string;
  soin?: Soin;
}

export function valeurDuBon(d: Pick<GiftInput, "type" | "montant" | "soin" | "variante">): Valeur {
  if (d.type === "montant") {
    const n = Number(String(d.montant ?? "").replace(",", "."));
    const ok = Number.isInteger(n) && n >= giftMin && n <= giftMax;
    return {
      prix: ok ? n : null,
      titre: ok ? formatPrix(n) : "— €",
      detail: "Montant libre, utilisable en une ou plusieurs fois",
    };
  }
  const s = getSoin(d.soin ?? "");
  if (!s) return { prix: null, titre: "Le soin de votre choix", detail: "À choisir dans la carte" };
  const v = s.variantes?.find((x) => x.label === d.variante);
  const duree = v?.duree ?? s.duree;
  const prix = s.variantes ? (v?.prix ?? null) : s.prix;
  // « 90 minutes » dit déjà la durée : on ne la répète pas.
  const labelDitDuree = !!v && /\bmin/.test(v.label);
  const parts = [
    v && v.label !== s.nom ? v.label : null,
    labelDitDuree ? null : formatDuree(duree),
    s.personnes === 2 ? "pour deux personnes" : null,
  ].filter(Boolean);
  return { prix, titre: s.nom, detail: parts.join(" · "), soin: s };
}

export function motifDe(id: MotifId) {
  return motifs.find((m) => m.id === id) ?? motifs[0];
}

/** Libellé de la valeur, pour les e-mails et le récapitulatif. */
export function libelleValeur(v: Valeur) {
  return v.soin ? `${v.titre} (${v.detail})${v.prix ? ` — ${formatPrix(v.prix)}` : ""}` : v.titre;
}

export const giftDefaults: GiftInput = {
  type: "montant",
  montant: "80",
  soin: "",
  variante: "",
  de: "",
  pour: "",
  message: "",
  motif: "galets",
  remise: "pdf",
  emailDestinataire: "",
  dateEnvoi: "",
  emailAcheteur: "",
  telephone: "",
  cgv: false,
  code: "",
  website: "",
};
