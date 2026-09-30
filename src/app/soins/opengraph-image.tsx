import { soins } from "@/data/soins";
import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Carte des soins de l'institut BRUME à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "La carte", title: "Carte des soins", detail: `${soins.length} soins · visage, corps, mains, duo` });
}
