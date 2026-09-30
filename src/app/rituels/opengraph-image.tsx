import { cures, detailsCure } from "@/data/rituels";
import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Cures et rituels duo de l'institut BRUME à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  const max = Math.max(...cures.map((c) => detailsCure(c).economie));
  return renderOg({ eyebrow: "Rituels & cures", title: "Cures 3 ou 5 séances, rituels en duo", detail: `Jusqu'à ${max} € d'économie · cabine duo` });
}
