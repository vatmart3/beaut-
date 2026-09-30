/** BRUME — les deux praticiennes. Remplacez noms, parcours et visuels. */

export interface Praticienne {
  id: string;
  prenom: string;
  nom: string;
  role: string;
  depuis: number;
  formation: string[];
  specialites: string[];
  /** Ce qu'elle dit de son métier, à la première personne. */
  mot: string;
  /** Jours de présence en cabine (0 = dimanche … 6 = samedi). */
  jours: number[];
  teinte: "argile" | "sauge";
}

export const praticiennes: Praticienne[] = [
  {
    id: "clemence",
    prenom: "Clémence",
    nom: "Aubry",
    role: "Fondatrice · soins visage",
    depuis: 2011,
    formation: [
      "BTS Métiers de l'esthétique-cosmétique-parfumerie, Montpellier",
      "Formation kobido et lifting manuel, 2019",
      "Formation peaux sensibilisées et barrière cutanée, 2023",
    ],
    specialites: ["Lift manuel", "Peaux sensibles", "Diagnostic de peau"],
    mot: "Je passe plus de temps à regarder une peau qu'à la traiter. Le bon geste vient après.",
    jours: [2, 3, 4, 5, 6],
    teinte: "argile",
  },
  {
    id: "ines",
    prenom: "Inès",
    nom: "Ferrand",
    role: "Praticienne · soins corps",
    depuis: 2016,
    formation: [
      "BP Esthétique cosmétique parfumerie",
      "Certificat de modelage bien-être (drainage manuel, techniques suédoises)",
      "Quatre saisons en spa thermal à Balaruc-les-Bains",
    ],
    specialites: ["Modelages", "Jambes légères", "Rituels au sel et à l'argile"],
    mot: "Un bon modelage, c'est un rythme. Si je le perds, vous le sentez. Alors je ne le perds pas.",
    jours: [2, 3, 4, 5, 6],
    teinte: "sauge",
  },
];

export function getPraticienne(id: string) {
  return praticiennes.find((p) => p.id === id);
}

export const anneesCumulees = (now = new Date()) =>
  praticiennes.reduce((acc, p) => acc + (now.getFullYear() - p.depuis), 0);
