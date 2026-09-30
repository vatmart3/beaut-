import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "L'institut BRUME : cabine duo et tisanerie à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "L'institut", title: "Un lieu calme, au cœur du quartier thermal", detail: "Cabine duo · tisanerie · deux praticiennes" });
}
