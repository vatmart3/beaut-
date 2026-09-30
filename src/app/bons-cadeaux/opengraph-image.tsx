import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Bon cadeau BRUME, institut de soins à Balaruc-les-Bains : montant libre ou soin, à imprimer ou envoyer par e-mail";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Bons cadeaux", title: "Une heure à soi, à offrir", detail: "Montant libre ou soin · valable 12 mois · PDF ou e-mail" });
}
