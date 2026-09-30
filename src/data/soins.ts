/**
 * BRUME — carte des soins.
 * Une entrée = une fiche soin (/soins/[slug]) + une offre JSON-LD.
 * Les prix sont TTC, les durées sont les durées réelles en cabine
 * (accueil et tisane non comptés).
 */

export type CategorieId = "visage" | "corps" | "epilations" | "mains-pieds" | "duo";

export type Besoin = "detente" | "eclat" | "tiraillement" | "jambes";
export type Zone = "visage" | "corps" | "les-deux";

/** Matières procédurales utilisées comme visuels (voir components/ui/Matiere.tsx). */
export type Matiere = "eau" | "argile" | "sel" | "lin" | "huile" | "galets" | "portrait";

export interface Etape {
  /** Minutes, ex. "0–5". */
  temps: string;
  geste: string;
}

export interface Variante {
  label: string;
  duree: number;
  prix: number;
}

export interface Soin {
  slug: string;
  nom: string;
  categorie: CategorieId;
  /** Une phrase, ce que le soin fait vraiment. */
  accroche: string;
  /** Textures, gestes, sensation. */
  description: string;
  duree: number;
  prix: number;
  /** « à partir de » quand il existe des variantes. */
  variantes?: Variante[];
  pourQui: string;
  deroule: Etape[];
  contreIndications: string[];
  avant: string[];
  apres: string[];
  produits: string;
  matiere: Matiere;
  besoins: Besoin[];
  zone: Zone;
  /** Identifiants de praticiennes (data/praticiennes.ts). */
  praticiennes: string[];
  /** Nombre de personnes (2 pour les soins duo). */
  personnes?: 1 | 2;
  signature?: boolean;
}

export const categories: { id: CategorieId; label: string; court: string; intro: string }[] = [
  {
    id: "visage",
    label: "Soins visage",
    court: "Visage",
    intro: "Diagnostic de peau à chaque rendez-vous, puis un protocole manuel : nettoyage, exfoliation douce, masque, lissages.",
  },
  {
    id: "corps",
    label: "Soins corps",
    court: "Corps",
    intro: "Sel marin, argiles, huiles tièdes. Des soins longs, qui prennent le temps de réchauffer les tissus avant de travailler.",
  },
  {
    id: "epilations",
    label: "Épilations",
    court: "Épilations",
    intro: "Cire tiède sans bande pour les zones sensibles, cire à bande pour les grandes surfaces. Spatule à usage unique.",
  },
  {
    id: "mains-pieds",
    label: "Mains & pieds",
    court: "Mains & pieds",
    intro: "Limage, cuticules, gommage, modelage, vernis classique ou semi-permanent. Instruments stérilisés en autoclave.",
  },
  {
    id: "duo",
    label: "Rituels duo",
    court: "Duo",
    intro: "La cabine duo accueille deux tables côte à côte. Deux praticiennes, le même tempo, un seul moment.",
  },
];

const ciGeneralesCorps = [
  "Grossesse : modelages et enveloppements adaptés uniquement après le premier trimestre, à signaler à la réservation.",
  "Phlébite, thrombose ou troubles circulatoires sévères.",
  "Fièvre, infection cutanée, plaie ouverte ou coup de soleil récent.",
];

const ciGeneralesVisage = [
  "Traitement à l'isotrétinoïne en cours ou arrêté depuis moins de 6 mois.",
  "Peeling médical, laser ou injection dans les 15 derniers jours.",
  "Herpès labial actif, eczéma ou lésion ouverte sur la zone.",
];

export const soins: Soin[] = [
  // ————————————————————————————————— VISAGE
  {
    slug: "hydratation-profonde",
    nom: "Hydratation profonde",
    categorie: "visage",
    accroche: "Le soin des peaux qui boivent tout et en redemandent.",
    description:
      "Double nettoyage à l'huile puis au lait, exfoliation enzymatique à la papaïne, sérum à l'acide hyaluronique en deux poids moléculaires, masque occlusif laissé 15 minutes sous compresses tièdes. Le modelage final se fait en pressions glissées, du centre vers l'extérieur, jusqu'au décolleté.",
    duree: 60,
    prix: 79,
    pourQui: "Peaux déshydratées par le soleil, le vent de la lagune ou la climatisation. Tous âges.",
    deroule: [
      { temps: "0–5", geste: "Diagnostic à la loupe lumineuse, questions sur votre routine." },
      { temps: "5–15", geste: "Démaquillage à l'huile, émulsion, puis lait nettoyant rincé aux éponges tièdes." },
      { temps: "15–22", geste: "Exfoliation enzymatique sous vapeur douce. Aucun grain, aucun frottement." },
      { temps: "22–37", geste: "Sérum hyaluronique, puis masque occlusif crème sous compresses tièdes. Modelage des mains et de la nuque pendant la pose." },
      { temps: "37–55", geste: "Modelage visage, cou, décolleté : effleurages, pressions glissées, lissages le long des maxillaires." },
      { temps: "55–60", geste: "Crème de jour, protection solaire. Vous repartez sans brillance." },
    ],
    contreIndications: ciGeneralesVisage,
    avant: ["Venez démaquillée si possible, mais ce n'est pas obligatoire.", "Évitez tout gommage maison 48 h avant."],
    apres: [
      "Pas de maquillage couvrant pendant 6 h : laissez la peau respirer.",
      "Buvez régulièrement dans la journée — l'hydratation vient aussi de l'intérieur.",
      "SPF 30 minimum le lendemain, même à l'ombre des platanes.",
    ],
    produits: "Gamme professionnelle Maison Salvia (placeholder) : sans parfum ajouté, sans huiles minérales.",
    matiere: "portrait",
    besoins: ["tiraillement", "eclat"],
    zone: "visage",
    praticiennes: ["clemence", "ines"],
    signature: true,
  },
  {
    slug: "eclat-express",
    nom: "Éclat express",
    categorie: "visage",
    accroche: "Trente minutes pour retrouver un teint net avant un dîner.",
    description:
      "Nettoyage, exfoliation à l'acide lactique à 5 %, masque à l'argile blanche (kaolin) posé en couche fine, sérum à la vitamine C stabilisée. Un soin court, précis, sans modelage long.",
    duree: 30,
    prix: 45,
    pourQui: "Teints ternes, fatigue, veille d'événement. Idéal en pause déjeuner.",
    deroule: [
      { temps: "0–6", geste: "Nettoyage au lait et lotion tonique au bleuet." },
      { temps: "6–12", geste: "Acide lactique au pinceau, temps de pose adapté à votre peau." },
      { temps: "12–22", geste: "Masque kaolin en couche fine, retiré avant séchage complet." },
      { temps: "22–30", geste: "Vitamine C, crème légère, SPF. Petit lissage des sourcils et des tempes." },
    ],
    contreIndications: ciGeneralesVisage,
    avant: ["Pas d'exposition solaire intense la veille."],
    apres: ["SPF 50 pendant 48 h : l'acide rend la peau plus sensible au soleil."],
    produits: "Maison Salvia (placeholder) — actifs à concentration cosmétique, non médicale.",
    matiere: "argile",
    besoins: ["eclat"],
    zone: "visage",
    praticiennes: ["clemence", "ines"],
  },
  {
    slug: "lift-manuel",
    nom: "Lift manuel",
    categorie: "visage",
    accroche: "Un travail des muscles du visage, entièrement à la main.",
    description:
      "Inspiré du kobido japonais : percussions légères, pétrissages fins, lissages rapides le long des muscles zygomatiques et du masséter. Aucune machine. Le soin se termine par un masque tenseur aux protéines de riz et un travail au gua sha en quartz rose, froid.",
    duree: 75,
    prix: 98,
    pourQui: "Premiers relâchements, traits tirés, mâchoire crispée (bruxisme). À partir de 35 ans, ou plus tôt pour la détente.",
    deroule: [
      { temps: "0–8", geste: "Diagnostic, observation des asymétries et des tensions de la mâchoire." },
      { temps: "8–18", geste: "Double nettoyage, exfoliation enzymatique." },
      { temps: "18–50", geste: "Modelage structurant : réveil du cuir chevelu, percussions, pétrissages, lissages en rythme rapide puis lent." },
      { temps: "50–65", geste: "Masque tenseur, gua sha en quartz rose sorti du réfrigérateur." },
      { temps: "65–75", geste: "Sérum, crème, conseils d'auto-massage de 2 minutes à refaire chez vous." },
    ],
    contreIndications: [...ciGeneralesVisage, "Fils tenseurs posés depuis moins de 3 mois."],
    avant: ["Retirez vos lentilles si vous en portez : les yeux sont travaillés en périphérie."],
    apres: ["Le visage peut être légèrement rosé 1 heure : c'est la microcirculation.", "L'effet est net à 48 h ; il s'installe avec une cure de 5 séances."],
    produits: "Maison Salvia (placeholder), huile de modelage au camélia.",
    matiere: "portrait",
    besoins: ["eclat", "detente"],
    zone: "visage",
    praticiennes: ["clemence"],
    signature: true,
  },
  {
    slug: "soin-barriere",
    nom: "Peau qui tire — soin barrière",
    categorie: "visage",
    accroche: "Pour les peaux qui chauffent, tiraillent et réagissent à tout.",
    description:
      "Protocole court en actifs, long en douceur : nettoyage sans rinçage, brume d'eau thermale, masque aux céramides et à l'avoine colloïdale, modelage en effleurages lents, sans pression. On répare avant de traiter.",
    duree: 60,
    prix: 82,
    pourQui: "Peaux sensibilisées : après l'été, un traitement asséchant, un changement de routine trop brusque.",
    deroule: [
      { temps: "0–8", geste: "Diagnostic, recherche des zones de rougeurs et des produits déclencheurs." },
      { temps: "8–15", geste: "Nettoyage à l'eau micellaire sans parfum, brume d'eau thermale." },
      { temps: "15–35", geste: "Masque céramides et avoine, compresses fraîches sur les pommettes." },
      { temps: "35–55", geste: "Modelage en effleurages lents, drainage manuel vers les ganglions du cou." },
      { temps: "55–60", geste: "Baume réparateur, SPF minéral." },
    ],
    contreIndications: ciGeneralesVisage,
    avant: ["Apportez la liste ou une photo des produits que vous utilisez : c'est souvent là que tout se joue."],
    apres: ["Routine minimale pendant 7 jours : nettoyant doux, crème, SPF. Rien d'autre."],
    produits: "Maison Salvia (placeholder), gamme sensible sans huiles essentielles.",
    matiere: "eau",
    besoins: ["tiraillement"],
    zone: "visage",
    praticiennes: ["clemence", "ines"],
  },
  {
    slug: "decouverte-visage",
    nom: "Première fois — soin découverte",
    categorie: "visage",
    accroche: "Quarante-cinq minutes pour comprendre votre peau.",
    description:
      "Un diagnostic complet de 15 minutes, puis un soin adapté à ce qu'on observe. Vous repartez avec une fiche écrite de votre routine idéale, sans obligation d'achat.",
    duree: 45,
    prix: 59,
    pourQui: "Premier soin en institut, ou envie de faire le point.",
    deroule: [
      { temps: "0–15", geste: "Diagnostic à la loupe, questions sur votre routine, votre sommeil, votre exposition." },
      { temps: "15–38", geste: "Nettoyage, exfoliation adaptée, masque, modelage court." },
      { temps: "38–45", geste: "Remise de votre fiche routine, écrite à la main." },
    ],
    contreIndications: ciGeneralesVisage,
    avant: ["Venez comme vous êtes, maquillée ou non."],
    apres: ["Gardez votre fiche : elle sert de base à tous vos prochains soins."],
    produits: "Maison Salvia (placeholder).",
    matiere: "lin",
    besoins: ["eclat", "tiraillement"],
    zone: "visage",
    praticiennes: ["clemence", "ines"],
  },

  // ————————————————————————————————— CORPS
  {
    slug: "gommage-sel-marin",
    nom: "Gommage au sel marin",
    categorie: "corps",
    accroche: "Sel fin, huile tiède, peau de soie.",
    description:
      "Sel marin fin mêlé à l'huile de pépins de raisin et à l'huile de sésame chauffées à 38 °C, appliqué en mouvements circulaires, zone par zone. Rinçage à la douche de la cabine, puis voile de lait corporel à l'amande douce.",
    duree: 30,
    prix: 45,
    pourQui: "Peaux sèches, rugueuses, avant les vacances ou pour faire durer un bronzage.",
    deroule: [
      { temps: "0–3", geste: "Installation sur table chauffante, drap de lin." },
      { temps: "3–20", geste: "Gommage des pieds vers les épaules, face arrière puis face avant." },
      { temps: "20–25", geste: "Douche tiède en cabine, serviettes chaudes." },
      { temps: "25–30", geste: "Lait corporel en effleurages rapides." },
    ],
    contreIndications: [...ciGeneralesCorps, "Épilation ou rasage de moins de 48 h (le sel pique)."],
    avant: ["Pas de rasage ni d'épilation 48 h avant."],
    apres: ["Hydratez matin et soir pendant 3 jours pour garder l'effet."],
    produits: "Sel marin fin de Méditerranée, huiles végétales vierges.",
    matiere: "sel",
    besoins: ["eclat", "detente"],
    zone: "corps",
    praticiennes: ["ines", "clemence"],
  },
  {
    slug: "enveloppement-argile",
    nom: "Enveloppement à l'argile verte",
    categorie: "corps",
    accroche: "L'argile tiède qui sèche lentement, et le silence.",
    description:
      "Argile verte surfine délayée à l'eau tiède et à l'hydrolat de romarin, posée en couche épaisse sur le dos, les jambes et le ventre. Vous êtes enveloppée dans une couverture chauffante 20 minutes pendant que la praticienne masse le cuir chevelu.",
    duree: 45,
    prix: 58,
    pourQui: "Tensions musculaires, peau grasse du dos, besoin de chaleur.",
    deroule: [
      { temps: "0–5", geste: "Installation, douche rapide si vous le souhaitez." },
      { temps: "5–15", geste: "Pose de l'argile au pinceau large." },
      { temps: "15–35", geste: "Enveloppement chauffant, modelage du cuir chevelu et du visage." },
      { temps: "35–45", geste: "Retrait à la douche, huile sèche au romarin." },
    ],
    contreIndications: [...ciGeneralesCorps, "Claustrophobie : l'enveloppement peut être partiel, dites-le-nous."],
    avant: ["Prévoyez 10 minutes de plus pour la douche."],
    apres: ["Évitez le hammam et le sauna le jour même : la peau a déjà beaucoup travaillé."],
    produits: "Argile verte surfine séchée au soleil, hydrolat de romarin.",
    matiere: "argile",
    besoins: ["detente"],
    zone: "corps",
    praticiennes: ["ines"],
  },
  {
    slug: "modelage-relaxant",
    nom: "Modelage relaxant",
    categorie: "corps",
    accroche: "Des gestes lents, enveloppants, qui ne s'arrêtent jamais.",
    description:
      "Huile tiède d'abricot et de tournesol, effleurages longs, pétrissages larges sur le dos et les cuisses, pressions glissées le long de la colonne. Une main reste toujours en contact avec vous. Pression ajustée au début du soin, puis on ne parle plus.",
    duree: 60,
    prix: 75,
    variantes: [
      { label: "60 minutes", duree: 60, prix: 75 },
      { label: "90 minutes", duree: 90, prix: 105 },
    ],
    pourQui: "Stress, sommeil court, besoin de lâcher. Premier modelage bienvenu.",
    deroule: [
      { temps: "0–5", geste: "Choix de la pression, respiration guidée, huile chauffée au bain-marie." },
      { temps: "5–30", geste: "Dos, épaules, nuque : effleurages puis pétrissages larges." },
      { temps: "30–50", geste: "Jambes et pieds, face arrière puis avant." },
      { temps: "50–60", geste: "Bras, mains, visage et cuir chevelu. Retour lent." },
    ],
    contreIndications: ciGeneralesCorps,
    avant: ["Évitez un repas copieux dans l'heure qui précède."],
    apres: ["Restez à la tisanerie autant que vous le souhaitez : le thé est offert, le temps aussi."],
    produits: "Huile végétale d'abricot et de tournesol, sans parfum ou parfumée à la fleur d'oranger au choix.",
    matiere: "huile",
    besoins: ["detente"],
    zone: "corps",
    praticiennes: ["ines", "clemence"],
    signature: true,
  },
  {
    slug: "jambes-legeres",
    nom: "Jambes légères",
    categorie: "corps",
    accroche: "Un drainage manuel lent, du pied jusqu'à l'aine.",
    description:
      "Inspiré du drainage lymphatique : pressions en pompage, douces et rythmées, du bas vers le haut. Gel frais à la menthe poivrée et à la vigne rouge, jambes surélevées pendant tout le soin.",
    duree: 45,
    prix: 62,
    pourQui: "Jambes lourdes en été, longues journées debout, après un voyage.",
    deroule: [
      { temps: "0–5", geste: "Installation jambes surélevées, respiration abdominale guidée." },
      { temps: "5–10", geste: "Ouverture des ganglions du creux poplité et de l'aine." },
      { temps: "10–40", geste: "Pompages et lissages en remontant, jambe après jambe." },
      { temps: "40–45", geste: "Gel frais, enveloppement léger 3 minutes." },
    ],
    contreIndications: [...ciGeneralesCorps, "Insuffisance cardiaque ou rénale : avis médical préalable."],
    avant: ["Portez un vêtement ample en bas pour repartir."],
    apres: ["Buvez un grand verre d'eau, marchez 10 minutes le long du front de lagune si vous pouvez."],
    produits: "Gel vigne rouge et menthe poivrée.",
    matiere: "eau",
    besoins: ["jambes"],
    zone: "corps",
    praticiennes: ["ines"],
  },
  {
    slug: "dos-nuque",
    nom: "Dos & nuque",
    categorie: "corps",
    accroche: "Trente minutes ciblées là où tout s'accumule.",
    description:
      "Pétrissages appuyés sur les trapèzes, frictions le long des omoplates, étirements doux de la nuque. Baume chauffant à l'arnica sur les zones nouées.",
    duree: 30,
    prix: 42,
    pourQui: "Écrans, conduite, épaules qui remontent vers les oreilles.",
    deroule: [
      { temps: "0–3", geste: "Repérage des zones tendues." },
      { temps: "3–25", geste: "Dos, trapèzes, nuque, pressions sur les points de tension." },
      { temps: "25–30", geste: "Étirements, baume à l'arnica." },
    ],
    contreIndications: ciGeneralesCorps,
    avant: ["Signalez toute douleur récente ou hernie."],
    apres: ["Faites rouler vos épaules 10 fois vers l'arrière, trois fois par jour."],
    produits: "Baume arnica et gaulthérie.",
    matiere: "galets",
    besoins: ["detente"],
    zone: "corps",
    praticiennes: ["ines", "clemence"],
  },
  {
    slug: "rituel-thau",
    nom: "Rituel Thau",
    categorie: "corps",
    accroche: "Sel, argile, huile. Le corps entier, dans l'ordre.",
    description:
      "Notre soin le plus complet : gommage au sel marin, enveloppement à l'argile verte, puis modelage relaxant de 40 minutes à l'huile tiède. Se termine par une tisane à la verveine du jardin, servie dans la tisanerie.",
    duree: 90,
    prix: 119,
    pourQui: "Un vrai temps pour soi, un cadeau, une fin de cure thermale.",
    deroule: [
      { temps: "0–20", geste: "Gommage au sel marin et à l'huile tiède, douche." },
      { temps: "20–45", geste: "Enveloppement à l'argile, modelage du cuir chevelu." },
      { temps: "45–85", geste: "Modelage relaxant du corps entier." },
      { temps: "85–90", geste: "Retour, tisane de verveine." },
    ],
    contreIndications: ciGeneralesCorps,
    avant: ["Pas de rasage 48 h avant.", "Prévoyez 2 heures au total."],
    apres: ["Évitez le soleil direct le jour même."],
    produits: "Sel marin, argile verte, huiles végétales vierges.",
    matiere: "sel",
    besoins: ["detente", "eclat"],
    zone: "corps",
    praticiennes: ["ines", "clemence"],
    signature: true,
  },

  // ————————————————————————————————— ÉPILATIONS
  {
    slug: "epilation-visage",
    nom: "Épilations visage",
    categorie: "epilations",
    accroche: "Sourcils restructurés à la pince et à la cire tiède.",
    description:
      "Cire tiède sans bande, spatule à usage unique, lotion apaisante à l'hamamélis. Pour les sourcils, on dessine d'abord au crayon avec vous, on épile ensuite.",
    duree: 15,
    prix: 9,
    variantes: [
      { label: "Lèvre supérieure", duree: 10, prix: 9 },
      { label: "Sourcils (entretien)", duree: 15, prix: 12 },
      { label: "Sourcils (restructuration)", duree: 25, prix: 18 },
      { label: "Visage complet", duree: 25, prix: 24 },
    ],
    pourQui: "Toutes les peaux, y compris sensibles.",
    deroule: [
      { temps: "0–3", geste: "Nettoyage, dessin au crayon pour les sourcils." },
      { temps: "3–12", geste: "Cire tiède, finitions à la pince." },
      { temps: "12–15", geste: "Lotion apaisante." },
    ],
    contreIndications: [...ciGeneralesVisage, "Rétinoïdes topiques dans les 7 derniers jours sur la zone."],
    avant: ["Laissez repousser 3 semaines minimum."],
    apres: ["Pas de maquillage ni d'exposition solaire pendant 12 h."],
    produits: "Cire tiède à la résine de pin, sans colophane.",
    matiere: "huile",
    besoins: [],
    zone: "visage",
    praticiennes: ["clemence", "ines"],
  },
  {
    slug: "epilation-corps",
    nom: "Épilations corps",
    categorie: "epilations",
    accroche: "Rapide, net, et une cire qui respecte les peaux fines.",
    description:
      "Cire à bande pour les jambes et les bras, cire tiède sans bande pour le maillot et les aisselles. Spatules à usage unique, jamais de double trempage.",
    duree: 20,
    prix: 13,
    variantes: [
      { label: "Aisselles", duree: 15, prix: 13 },
      { label: "Maillot classique", duree: 15, prix: 16 },
      { label: "Maillot échancré", duree: 20, prix: 22 },
      { label: "Maillot intégral", duree: 30, prix: 34 },
      { label: "Demi-jambes", duree: 20, prix: 22 },
      { label: "Jambes complètes", duree: 35, prix: 32 },
      { label: "Demi-jambes + maillot + aisselles", duree: 45, prix: 46 },
    ],
    pourQui: "Toutes, dès que les poils mesurent 5 mm.",
    deroule: [
      { temps: "0–3", geste: "Nettoyage, talc végétal." },
      { temps: "3–30", geste: "Épilation zone par zone, peau tendue pour limiter la sensation." },
      { temps: "fin", geste: "Huile post-épilatoire au calendula." },
    ],
    contreIndications: ciGeneralesCorps,
    avant: ["Pas de rasage depuis 3 semaines.", "Gommage doux 48 h avant."],
    apres: ["Pas de soleil, de hammam ni de piscine pendant 24 h.", "Gommage doux une fois par semaine contre les poils incarnés."],
    produits: "Cires à la résine de pin, huile de calendula.",
    matiere: "huile",
    besoins: [],
    zone: "corps",
    praticiennes: ["ines", "clemence"],
  },

  // ————————————————————————————————— MAINS & PIEDS
  {
    slug: "beaute-des-mains",
    nom: "Beauté des mains",
    categorie: "mains-pieds",
    accroche: "Ongles limés, cuticules repoussées, mains qui sentent l'amande.",
    description:
      "Bain tiède, limage, repousse des cuticules au bâtonnet de buis, gommage au sucre, modelage de 10 minutes jusqu'au coude, pose de vernis classique ou soin fortifiant.",
    duree: 45,
    prix: 38,
    variantes: [
      { label: "Beauté des mains", duree: 45, prix: 38 },
      { label: "Avec semi-permanent", duree: 60, prix: 45 },
      { label: "Dépose seule", duree: 20, prix: 15 },
    ],
    pourQui: "Mains sèches, ongles cassants, envie d'une manucure qui tient.",
    deroule: [
      { temps: "0–10", geste: "Démaquillage des ongles, bain tiède, limage." },
      { temps: "10–20", geste: "Cuticules, gommage au sucre." },
      { temps: "20–30", geste: "Modelage mains et avant-bras." },
      { temps: "30–45", geste: "Base, deux couches, top coat." },
    ],
    contreIndications: ["Mycose de l'ongle, panaris, plaie sur les mains."],
    avant: ["Venez sans vernis si possible (sinon dépose incluse pour le classique)."],
    apres: ["Gants pour la vaisselle, huile à cuticules chaque soir."],
    produits: "Vernis 12-free, huile d'amande douce.",
    matiere: "lin",
    besoins: ["detente"],
    zone: "corps",
    praticiennes: ["ines", "clemence"],
  },
  {
    slug: "beaute-des-pieds",
    nom: "Beauté des pieds",
    categorie: "mains-pieds",
    accroche: "Talons lissés, pieds prêts pour les sandales.",
    description:
      "Bain de pieds au sel et à la lavande, coupe et limage, travail des callosités à la râpe (jamais de lame), gommage, modelage de la voûte plantaire, vernis.",
    duree: 50,
    prix: 45,
    variantes: [
      { label: "Beauté des pieds", duree: 50, prix: 45 },
      { label: "Avec semi-permanent", duree: 65, prix: 52 },
    ],
    pourQui: "Talons secs, pieds fatigués, avant l'été ou après.",
    deroule: [
      { temps: "0–10", geste: "Bain de pieds tiède au sel et à la lavande." },
      { temps: "10–25", geste: "Coupe, limage, cuticules, callosités à la râpe." },
      { temps: "25–40", geste: "Gommage, modelage plantaire et des mollets." },
      { temps: "40–50", geste: "Vernis ou soin nourrissant." },
    ],
    contreIndications: ["Diabète : signalez-le, nous adaptons le protocole (pas de râpe).", "Mycose, verrue plantaire, plaie."],
    avant: ["Ne rasez pas vos jambes le jour même."],
    apres: ["Crème pieds le soir, chaussettes en coton par-dessus pour la nuit."],
    produits: "Sel marin, huile essentielle de lavande vraie, vernis 12-free.",
    matiere: "galets",
    besoins: ["jambes", "detente"],
    zone: "corps",
    praticiennes: ["ines"],
  },

  // ————————————————————————————————— DUO
  {
    slug: "modelage-duo",
    nom: "Modelage duo",
    categorie: "duo",
    accroche: "Deux tables côte à côte, deux praticiennes, le même tempo.",
    description:
      "Le modelage relaxant de 60 minutes, pour deux, dans la cabine duo. Les praticiennes accordent leurs gestes pour que vous viviez le même soin au même moment. Tisane et fruits secs dans la tisanerie avant et après.",
    duree: 60,
    prix: 150,
    pourQui: "Couple, amies, mère et fille. À partir de 16 ans avec autorisation parentale.",
    deroule: [
      { temps: "0–5", geste: "Installation côte à côte, choix de l'huile ensemble." },
      { temps: "5–55", geste: "Modelage relaxant du corps entier, gestes synchronisés." },
      { temps: "55–60", geste: "Retour lent, puis tisanerie privatisée 20 minutes." },
    ],
    contreIndications: ciGeneralesCorps,
    avant: ["Arrivez ensemble 10 minutes avant."],
    apres: ["La tisanerie vous est réservée 20 minutes après le soin."],
    produits: "Huiles végétales vierges, au choix sans parfum ou fleur d'oranger.",
    matiere: "huile",
    besoins: ["detente"],
    zone: "corps",
    praticiennes: ["clemence", "ines"],
    personnes: 2,
    signature: true,
  },
  {
    slug: "rituel-duo-bassin-de-thau",
    nom: "Rituel duo Bassin de Thau",
    categorie: "duo",
    accroche: "Gommage au sel, modelage, soin visage express. À deux.",
    description:
      "Le Rituel Thau réinventé pour la cabine duo : gommage au sel marin, modelage de 45 minutes, puis un éclat express du visage. Vous terminez par un plateau de tisane et de biscuits aux amandes dans la tisanerie privatisée.",
    duree: 90,
    prix: 230,
    pourQui: "Anniversaire, cadeau à deux, dernière journée de vacances à Balaruc.",
    deroule: [
      { temps: "0–20", geste: "Gommage au sel marin, douche." },
      { temps: "20–65", geste: "Modelage relaxant synchronisé." },
      { temps: "65–85", geste: "Éclat express du visage." },
      { temps: "85–90", geste: "Tisanerie privatisée." },
    ],
    contreIndications: [...ciGeneralesCorps, ...ciGeneralesVisage.slice(0, 1)],
    avant: ["Pas de rasage 48 h avant.", "Prévoyez 2 h au total."],
    apres: ["Hydratez-vous, évitez le soleil direct le jour même."],
    produits: "Sel marin, huiles végétales, Maison Salvia (placeholder).",
    matiere: "sel",
    besoins: ["detente", "eclat"],
    zone: "les-deux",
    praticiennes: ["clemence", "ines"],
    personnes: 2,
  },
];

export function getSoin(slug: string): Soin | undefined {
  return soins.find((s) => s.slug === slug);
}

export function getCategorie(id: CategorieId) {
  return categories.find((c) => c.id === id)!;
}

/** Prix d'appel (le plus bas des variantes). */
export function prixDepart(s: Soin): number {
  return s.variantes ? Math.min(...s.variantes.map((v) => v.prix)) : s.prix;
}

export function formatPrix(n: number): string {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}\u00A0€`;
}

export function formatDuree(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}
