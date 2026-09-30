/**
 * BRUME — cures et forfaits.
 * L'économie est calculée automatiquement à partir du prix unitaire du soin.
 */
import { getSoin } from "./soins";

export interface Cure {
  id: string;
  soin: string; // slug
  seances: 3 | 5;
  prix: number;
  rythme: string;
  pourquoi: string;
}

export const cures: Cure[] = [
  {
    id: "hydratation-3",
    soin: "hydratation-profonde",
    seances: 3,
    prix: 215,
    rythme: "Une séance toutes les 3 semaines",
    pourquoi: "Le temps d'un cycle complet de renouvellement cellulaire : la troisième séance travaille sur une peau déjà rééquilibrée.",
  },
  {
    id: "hydratation-5",
    soin: "hydratation-profonde",
    seances: 5,
    prix: 339,
    rythme: "Une séance toutes les 3 semaines",
    pourquoi: "Pour traverser un été ou un hiver complet avec une peau qui ne tire plus.",
  },
  {
    id: "lift-5",
    soin: "lift-manuel",
    seances: 5,
    prix: 420,
    rythme: "Une séance par semaine pendant 5 semaines",
    pourquoi: "Le lift manuel travaille le tonus musculaire : c'est la régularité qui fixe le résultat.",
  },
  {
    id: "jambes-5",
    soin: "jambes-legeres",
    seances: 5,
    prix: 265,
    rythme: "Deux séances par semaine, de juin à août",
    pourquoi: "Le drainage est plus efficace en séances rapprochées, surtout pendant les fortes chaleurs.",
  },
  {
    id: "modelage-5",
    soin: "modelage-relaxant",
    seances: 5,
    prix: 320,
    rythme: "Libre, sur 6 mois",
    pourquoi: "Un rendez-vous fixe avec vous-même. La carte est nominative mais peut être partagée avec une personne de votre foyer.",
  },
];

export function detailsCure(c: Cure) {
  const soin = getSoin(c.soin)!;
  const unitaire = soin.prix * c.seances;
  const economie = unitaire - c.prix;
  const parSeance = Math.round((c.prix / c.seances) * 100) / 100;
  return { soin, unitaire, economie, parSeance };
}
