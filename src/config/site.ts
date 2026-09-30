/**
 * BRUME — configuration client.
 *
 * Tout ce qu'un vrai client doit modifier (coordonnées, horaires, réseaux,
 * mentions) est regroupé ici. Les contenus métier (soins, avis, planning…)
 * sont dans `src/data/`.
 */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://brume-institut.vercel.app").replace(/\/$/, "");

export type DayKey = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";

export interface OpeningSlot {
  day: DayKey;
  /** Plages au format HH:MM. Vide = fermé. */
  ranges: { opens: string; closes: string }[];
}

export const site = {
  name: "BRUME",
  fullName: "BRUME — Institut de soins",
  legalName: "BRUME Institut de soins (EI à compléter)",
  tagline: "Institut de soins à Balaruc-les-Bains",
  description:
    "Institut de beauté indépendant à Balaruc-les-Bains : soins visage, gommages au sel, enveloppements à l'argile, modelages, épilations et rituels en cabine duo. Deux praticiennes, sur rendez-vous.",
  locale: "fr_FR",

  contact: {
    phone: "04 67 00 00 42",
    phoneHref: "tel:+33467000042",
    phoneE164: "+33467000042",
    email: "bonjour@exemple.fr",
    /** Délai de réponse affiché partout (réassurance). */
    responseTime: "sous 24 h ouvrées",
  },

  address: {
    street: "4 rue des Sources",
    postalCode: "34540",
    city: "Balaruc-les-Bains",
    region: "Occitanie",
    department: "Hérault",
    country: "FR",
    /** Coordonnées approximatives du centre de Balaruc-les-Bains. */
    geo: { lat: 43.4419, lng: 3.6779 },
    access: [
      "Au cœur de la station thermale, à 4 minutes à pied des thermes.",
      "Stationnement gratuit dans la rue et parking public à 200 m.",
      "Depuis Sète : 12 minutes en voiture par la D2. Depuis Frontignan : 15 minutes. Depuis Mèze : 18 minutes.",
      "Institut de plain-pied, accessible aux personnes à mobilité réduite.",
    ],
  },

  /** Horaires d'ouverture. Utilisés par le footer, les infos pratiques, le JSON-LD. */
  hours: [
    { day: "lundi", ranges: [] },
    { day: "mardi", ranges: [{ opens: "09:30", closes: "19:00" }] },
    { day: "mercredi", ranges: [{ opens: "09:30", closes: "19:00" }] },
    { day: "jeudi", ranges: [{ opens: "09:30", closes: "20:30" }] },
    { day: "vendredi", ranges: [{ opens: "09:30", closes: "19:00" }] },
    { day: "samedi", ranges: [{ opens: "09:00", closes: "17:00" }] },
    { day: "dimanche", ranges: [] },
  ] satisfies OpeningSlot[],

  hoursNote: "Nocturne le jeudi jusqu'à 20 h 30. Fermé le dimanche et le lundi.",

  areaServed: [
    "Balaruc-les-Bains",
    "Balaruc-le-Vieux",
    "Sète",
    "Frontignan",
    "Mèze",
    "Bouzigues",
    "Poussan",
    "Gigean",
    "Marseillan",
  ],

  priceRange: "9 € – 230 €",

  social: {
    instagram: "https://www.instagram.com/",
  },

  /** Conditions affichées en réassurance et dans les CGV. */
  policies: {
    cancellation: "Annulation ou report sans frais jusqu'à 24 h avant le rendez-vous.",
    giftValidityMonths: 12,
    giftMin: 30,
    giftMax: 500,
    payment: "Carte bancaire, espèces, chèques-cadeaux BRUME. Règlement sur place, après le soin.",
  },

  /** Signature agence (footer). */
  agency: {
    label: "Site concept — design & développement MJAGENCY",
    url: "https://mjagency.eu",
  },

  /** Mentions légales à compléter par le client. */
  legal: {
    owner: "[Nom et prénom de l'exploitante]",
    status: "[Forme juridique — ex. entreprise individuelle]",
    siret: "[SIRET à compléter]",
    rcs: "[RCS / RNE à compléter]",
    vat: "[N° TVA intracommunautaire ou « TVA non applicable, art. 293 B du CGI »]",
    publicationDirector: "[Nom de la directrice de publication]",
    host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com",
    insurance: "[Assureur RC professionnelle et n° de contrat]",
    mediator: "[Médiateur de la consommation — nom et site]",
  },
} as const;

export const nav = [
  { href: "/soins", label: "Les soins", hint: "visage, corps, mains & pieds" },
  { href: "/rituels", label: "Rituels & cures", hint: "3 ou 5 séances, duo" },
  { href: "/bons-cadeaux", label: "Bons cadeaux", hint: "à imprimer ou envoyer" },
  { href: "/institut", label: "L'institut", hint: "le lieu, les mains, l'hygiène" },
  { href: "/infos-pratiques", label: "Infos pratiques", hint: "accès, horaires" },
  { href: "/faq", label: "Questions", hint: "avant votre premier soin" },
  { href: "/reserver", label: "Réserver", hint: "en ligne, en 3 étapes" },
] as const;

export const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${site.address.street}, ${site.address.postalCode} ${site.address.city}`,
)}`;

export const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.name} ${site.address.street} ${site.address.postalCode} ${site.address.city}`,
)}`;

export const fullAddress = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;
