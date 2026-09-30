/**
 * BRUME — quiz « Votre rituel en 4 questions ».
 * Le résultat est calculé par un score simple et transparent (voir `recommander`).
 */
import { soins, prixDepart, type Besoin, type Soin, type Zone } from "./soins";

export type Temps = 30 | 60 | 90;
export type Budget = "leger" | "moyen" | "genereux";

export interface ReponsesQuiz {
  besoin?: Besoin;
  temps?: Temps;
  zone?: Zone;
  budget?: Budget;
}

export const questions = [
  {
    id: "besoin",
    titre: "De quoi avez-vous besoin, là, maintenant ?",
    options: [
      { value: "detente", label: "Lâcher prise", detail: "épaules hautes, sommeil court", icone: "vague", photo: "epaules" },
      { value: "eclat", label: "De l'éclat", detail: "teint terne, traits tirés", icone: "soleil", photo: "visageSerre" },
      { value: "tiraillement", label: "Ma peau tire", detail: "après le soleil, le vent, un traitement", icone: "fissure", photo: "peau" },
      { value: "jambes", label: "Jambes lourdes", detail: "chaleur, station debout", icone: "jambes", photo: "jambes" },
    ],
  },
  {
    id: "temps",
    titre: "Combien de temps pouvez-vous vous accorder ?",
    options: [
      { value: 30, label: "30 minutes", detail: "une pause déjeuner", icone: "sablier-1" },
      { value: 60, label: "1 heure", detail: "le bon rythme", icone: "sablier-2" },
      { value: 90, label: "1 h 30", detail: "et même un peu plus", icone: "sablier-3" },
    ],
  },
  {
    id: "zone",
    titre: "On s'occupe plutôt…",
    options: [
      { value: "visage", label: "Du visage", detail: "peau, traits, teint", icone: "visage", photo: "visage" },
      { value: "corps", label: "Du corps", detail: "dos, jambes, peau", icone: "corps", photo: "epaules" },
      { value: "les-deux", label: "Des deux", detail: "on ne choisit pas", icone: "deux", photo: "duo" },
    ],
  },
  {
    id: "budget",
    titre: "Quel budget avez-vous en tête ?",
    options: [
      { value: "leger", label: "Moins de 50 €", detail: "un soin ciblé", icone: "galet-1" },
      { value: "moyen", label: "50 à 90 €", detail: "un soin complet", icone: "galet-2" },
      { value: "genereux", label: "Plus de 90 €", detail: "un rituel", icone: "galet-3" },
    ],
  },
] as const;

const budgetMax: Record<Budget, number> = { leger: 50, moyen: 90, genereux: 1000 };
const budgetMin: Record<Budget, number> = { leger: 0, moyen: 45, genereux: 85 };

function score(s: Soin, r: Required<ReponsesQuiz>) {
  let pts = 0;
  if (s.besoins.includes(r.besoin)) pts += 6;
  if (s.zone === r.zone) pts += 4;
  else if (s.zone === "les-deux" || r.zone === "les-deux") pts += 2;
  const ecart = Math.abs(s.duree - r.temps);
  pts += ecart === 0 ? 3 : ecart <= 15 ? 2 : ecart <= 30 ? 1 : -1;
  const p = prixDepart(s);
  if (p <= budgetMax[r.budget] && p >= budgetMin[r.budget]) pts += 3;
  else if (p > budgetMax[r.budget]) pts -= 3;
  if (s.signature) pts += 0.5;
  return pts;
}

/** Retourne le soin recommandé et une alternative (catégories différentes si possible). */
export function recommander(r: Required<ReponsesQuiz>): { principal: Soin; alternative: Soin } {
  const candidats = soins
    .filter((s) => s.categorie !== "epilations" && s.personnes !== 2)
    .map((s) => ({ s, pts: score(s, r) }))
    .sort((a, b) => b.pts - a.pts);
  const principal = candidats[0].s;
  const alternative =
    candidats.find((c) => c.s.slug !== principal.slug && c.s.categorie !== principal.categorie && c.pts > 4)?.s ??
    candidats[1].s;
  return { principal, alternative };
}
