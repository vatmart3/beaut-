/**
 * BRUME — avis clients.
 *
 * ⚠️ DÉMONSTRATION : ces avis sont fictifs et servent uniquement à montrer la
 * mise en page. Remplacez-les par les vrais avis de vos clientes (avec leur
 * accord écrit) avant toute mise en ligne. Ne publiez jamais de note ou de
 * logo d'une plateforme tierce sans en respecter les conditions.
 */

export interface Avis {
  prenom: string;
  ville: string;
  soin: string;
  date: string; // AAAA-MM
  texte: string;
  /** Extrait court affiché en grand. */
  extrait: string;
}

export const avis: Avis[] = [
  {
    prenom: "Nathalie R.",
    ville: "Sète",
    soin: "Lift manuel",
    date: "2026-06",
    extrait: "Ma mâchoire s'est desserrée pour la première fois depuis des mois.",
    texte:
      "Je serre les dents la nuit. Clémence l'a vu en deux minutes, sans que je le dise. Ma mâchoire s'est desserrée pour la première fois depuis des mois, et elle m'a montré un geste à refaire le soir. Je le fais.",
  },
  {
    prenom: "Julien et Marie",
    ville: "Montpellier",
    soin: "Rituel duo Bassin de Thau",
    date: "2026-05",
    extrait: "On a offert le duo à nos parents, puis on l'a réservé pour nous.",
    texte:
      "On a offert le duo à nos parents pour leurs quarante ans de mariage, ils en ont parlé pendant une semaine. On l'a réservé pour nous le mois suivant. La tisanerie après le soin, seuls, c'est ce qui fait la différence.",
  },
  {
    prenom: "Sophie L.",
    ville: "Frontignan",
    soin: "Peau qui tire — soin barrière",
    date: "2026-08",
    extrait: "On m'a retiré trois produits de ma routine au lieu de m'en vendre un.",
    texte:
      "J'arrivais avec une peau rouge après l'été. On m'a retiré trois produits de ma routine au lieu de m'en vendre un. Deux semaines plus tard, plus de sensation de brûlure.",
  },
  {
    prenom: "Hélène D.",
    ville: "Curiste, Lyon",
    soin: "Jambes légères",
    date: "2026-07",
    extrait: "Entre deux soins aux thermes, c'est ici que mes jambes ont compris.",
    texte:
      "Trois semaines de cure à Balaruc et des jambes toujours lourdes en fin de journée. Inès a pris le temps de m'expliquer le drainage, geste par geste. Entre deux soins aux thermes, c'est ici que mes jambes ont compris.",
  },
  {
    prenom: "Camille B.",
    ville: "Mèze",
    soin: "Modelage relaxant 90 min",
    date: "2026-03",
    extrait: "Une main est restée posée sur moi du début à la fin.",
    texte:
      "Une main est restée posée sur moi du début à la fin, je ne sais pas comment elle fait. Je me suis endormie à la quarantième minute et je n'ai pas eu honte.",
  },
  {
    prenom: "Laure M.",
    ville: "Balaruc-le-Vieux",
    soin: "Épilations",
    date: "2026-04",
    extrait: "Rapide, net, et on ne me fait pas la conversation si je n'en ai pas envie.",
    texte:
      "Je viens toutes les quatre semaines depuis l'ouverture. Rapide, net, et on ne me fait pas la conversation si je n'en ai pas envie. Les rendez-vous commencent à l'heure.",
  },
  {
    prenom: "Agnès P.",
    ville: "Bouzigues",
    soin: "Première fois — soin découverte",
    date: "2026-02",
    extrait: "À 58 ans, mon premier soin visage. Je suis repartie avec une fiche écrite à la main.",
    texte:
      "À 58 ans, mon premier soin visage. Je suis repartie avec une fiche écrite à la main et une routine de trois produits, dont deux que j'avais déjà chez moi.",
  },
];

/** Chiffres de réassurance — à mettre à jour par le client. */
export const chiffres = {
  clientesParMois: 180,
  tauxRetour: 72, // % de clientes qui reviennent dans les 3 mois (à vérifier)
  tempsTisanerie: 20, // minutes offertes après chaque soin
};
