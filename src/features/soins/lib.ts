import { cures, detailsCure, type Cure } from "@/data/rituels";
import { soins, type Soin } from "@/data/soins";
import { serviceJsonLd } from "@/lib/seo";
import { siteUrl } from "@/config/site";

/** La cure la plus longue proposée pour un soin (celle qui ancre le mieux le prix). */
export function cureDe(slug: string): (Cure & ReturnType<typeof detailsCure>) | null {
  const list = cures.filter((c) => c.soin === slug).sort((a, b) => b.seances - a.seances);
  return list[0] ? { ...list[0], ...detailsCure(list[0]) } : null;
}

/**
 * 2 à 3 soins liés : même catégorie d'abord, puis besoins communs,
 * en évitant de proposer deux fois la même matière quand c'est possible.
 */
export function soinsLies(s: Soin, max = 3): Soin[] {
  const score = (o: Soin) =>
    (o.categorie === s.categorie ? 3 : 0) + o.besoins.filter((b) => s.besoins.includes(b)).length * 2 + (o.zone === s.zone ? 1 : 0) + (o.signature ? 0.5 : 0);
  return soins
    .filter((o) => o.slug !== s.slug)
    .map((o) => ({ o, sc: score(o) }))
    .filter((x) => x.sc >= 2)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, max)
    .map((x) => x.o);
}

/** `serviceJsonLd` sans son `@context`, pour l'imbriquer dans une ItemList. */
function service(s: Soin) {
  return Object.fromEntries(Object.entries(serviceJsonLd(s)).filter(([k]) => k !== "@context"));
}

export function carteJsonLd(list: Soin[] = soins) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}/soins#carte`,
    name: "Carte des soins BRUME — Balaruc-les-Bains",
    numberOfItems: list.length,
    itemListElement: list.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl}/soins/${s.slug}`, item: service(s) })),
  };
}

/** Numéro éditorial à deux chiffres : 1 → « 01 ». */
export const numero = (i: number) => String(i + 1).padStart(2, "0");

/** Métadonnées d'une fiche : title ≤ 60, description ≤ 155, toujours avec « Balaruc-les-Bains ». */
export function ficheMeta(s: Soin, prix: string, duree: string) {
  const titles = [
    `${s.nom} à Balaruc-les-Bains · BRUME`,
    `${s.nom} · Balaruc-les-Bains`,
    `${s.nom.split(" — ")[0]} · Balaruc-les-Bains`,
  ];
  const title = titles.find((t) => t.length <= 60) ?? titles[titles.length - 1].slice(0, 60);
  const head = `${s.nom} à Balaruc-les-Bains : ${duree}, dès ${prix}.`;
  const full = `${head} ${s.accroche}`;
  let description = full;
  if (full.length > 155) {
    const alt = `${head} Chez BRUME, institut de soins.`;
    description = alt.length <= 155 ? alt : head.slice(0, 155);
  }
  return { title, description };
}
