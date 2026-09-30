import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Mentions légales du site de l'institut BRUME, Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Informations légales", title: "Mentions légales", detail: "Éditeur, hébergeur, crédits" });
}
