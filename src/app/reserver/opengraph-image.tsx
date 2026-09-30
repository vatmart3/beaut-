import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Réserver un soin chez BRUME, institut de soins à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Réservation", title: "Réserver un soin en trois gestes", detail: "Créneaux réels · confirmation sous 24 h ouvrées" });
}
