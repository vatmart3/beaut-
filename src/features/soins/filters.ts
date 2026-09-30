import { categories, formatDuree, prixDepart, type CategorieId, type Soin } from "@/data/soins";

/**
 * Filtres de la carte des soins. Toute la logique est pure (testable,
 * partagée entre le rendu statique de repli et la version synchronisée à l'URL).
 *
 * Un soin correspond à un filtre de durée ou de prix si SA FORMULE DE BASE ou
 * L'UNE DE SES VARIANTES y correspond : un modelage 60 / 90 min apparaît donc
 * à la fois dans « 45–60 min » et dans « 75 min et + ».
 */

export type DureeId = "30" | "45-60" | "75-plus";
export type PrixId = "moins-de-50" | "50-90" | "plus-de-90";

export interface Filtres {
  categorie: CategorieId | null;
  duree: DureeId | null;
  prix: PrixId | null;
}

export const filtresVides: Filtres = { categorie: null, duree: null, prix: null };

export const optionsCategorie: { id: CategorieId | null; label: string }[] = [
  { id: null, label: "Tout" },
  ...categories.map((c) => ({ id: c.id, label: c.court })),
];

export const optionsDuree: { id: DureeId | null; label: string; test: (min: number) => boolean }[] = [
  { id: null, label: "Toutes", test: () => true },
  { id: "30", label: "≤ 30 min", test: (m) => m <= 30 },
  { id: "45-60", label: "45–60 min", test: (m) => m > 30 && m < 75 },
  { id: "75-plus", label: "75 min et +", test: (m) => m >= 75 },
];

export const optionsPrix: { id: PrixId | null; label: string; test: (p: number) => boolean }[] = [
  { id: null, label: "Tous", test: () => true },
  { id: "moins-de-50", label: "< 50 €", test: (p) => p < 50 },
  { id: "50-90", label: "50–90 €", test: (p) => p >= 50 && p <= 90 },
  { id: "plus-de-90", label: "> 90 €", test: (p) => p > 90 },
];

const formules = (s: Soin) => s.variantes ?? [{ label: s.nom, duree: s.duree, prix: s.prix }];

export function filtrer(list: Soin[], f: Filtres): Soin[] {
  const d = optionsDuree.find((o) => o.id === f.duree) ?? optionsDuree[0];
  const p = optionsPrix.find((o) => o.id === f.prix) ?? optionsPrix[0];
  return list.filter(
    (s) =>
      (!f.categorie || s.categorie === f.categorie) &&
      formules(s).some((v) => d.test(v.duree)) &&
      formules(s).some((v) => p.test(v.prix)),
  );
}

function pick<T extends string>(value: string | null, allowed: readonly (T | null)[]): T | null {
  return value && (allowed as readonly (string | null)[]).includes(value) ? (value as T) : null;
}

/** Lecture tolérante : une valeur inconnue dans l'URL est simplement ignorée. */
export function lireFiltres(sp: { get(name: string): string | null }): Filtres {
  return {
    categorie: pick<CategorieId>(sp.get("categorie"), optionsCategorie.map((o) => o.id)),
    duree: pick<DureeId>(sp.get("duree"), optionsDuree.map((o) => o.id)),
    prix: pick<PrixId>(sp.get("prix"), optionsPrix.map((o) => o.id)),
  };
}

export function ecrireFiltres(f: Filtres): string {
  const sp = new URLSearchParams();
  if (f.categorie) sp.set("categorie", f.categorie);
  if (f.duree) sp.set("duree", f.duree);
  if (f.prix) sp.set("prix", f.prix);
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export const estVide = (f: Filtres) => !f.categorie && !f.duree && !f.prix;

/** Plage de durée lisible : « 60 min », « 60 – 90 min », « 10 – 45 min ». */
export function plageDuree(s: Soin): string {
  const ds = formules(s).map((v) => v.duree);
  const min = Math.min(...ds);
  const max = Math.max(...ds);
  if (min === max) return formatDuree(min);
  return `${min} – ${max} min`;
}

export const aPartirDe = (s: Soin) => Boolean(s.variantes && s.variantes.length > 1 && s.variantes.some((v) => v.prix !== prixDepart(s)));
