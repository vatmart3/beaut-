import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Fiche conseil offerte : routine peau après une journée de mer, par une esthéticienne";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Fiche conseil", title: "Routine peau après une journée de mer", detail: "Offerte, à imprimer · par une esthéticienne" });
}
