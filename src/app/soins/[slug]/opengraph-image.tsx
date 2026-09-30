import { formatPrix, getCategorie, getSoin, prixDepart, soins } from "@/data/soins";
import { renderOg, ogSize, ogContentType } from "@/lib/og";
import { plageDuree } from "@/features/soins/filters";

export const alt = "Soin à l'institut BRUME, Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return soins.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const soin = getSoin(slug) ?? soins[0];
  const des = soin.variantes && soin.variantes.length > 1 ? "dès " : "";
  return renderOg({
    eyebrow: getCategorie(soin.categorie).label,
    title: soin.nom,
    detail: `${plageDuree(soin)} · ${des}${formatPrix(prixDepart(soin))}${soin.personnes === 2 ? " pour deux" : ""}`,
  });
}
