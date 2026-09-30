import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Conditions générales de vente des bons cadeaux BRUME, institut de soins à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Conditions de vente", title: "Bons cadeaux : les conditions", detail: "Validité, paiement, rétractation, réclamations" });
}
