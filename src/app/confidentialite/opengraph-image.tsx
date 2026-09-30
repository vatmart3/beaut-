import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Politique de confidentialité de l'institut BRUME";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Vos données", title: "Confidentialité et données personnelles", detail: "RGPD · aucun traceur sans votre accord" });
}
