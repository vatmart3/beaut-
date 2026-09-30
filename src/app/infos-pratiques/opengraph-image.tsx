import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Accès, horaires et stationnement de l'institut BRUME à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Infos pratiques", title: "4 rue des Sources, Balaruc-les-Bains", detail: "À 4 min à pied des thermes · parking gratuit" });
}
