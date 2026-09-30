import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Questions fréquentes — institut BRUME à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Questions", title: "Avant votre premier soin", detail: "Réserver, annuler, grossesse, bons cadeaux, accès" });
}
