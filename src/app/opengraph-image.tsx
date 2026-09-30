import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "BRUME — institut de soins à Balaruc-les-Bains";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ eyebrow: "Institut de soins", title: "Visage, corps et rituels en duo", detail: "4 rue des Sources · sur rendez-vous" });
}
