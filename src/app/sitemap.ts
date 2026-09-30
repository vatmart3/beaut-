import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { soins } from "@/data/soins";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"],
    ["/soins", 0.9, "monthly"],
    ["/rituels", 0.8, "monthly"],
    ["/bons-cadeaux", 0.9, "monthly"],
    ["/institut", 0.7, "yearly"],
    ["/reserver", 0.9, "weekly"],
    ["/infos-pratiques", 0.7, "yearly"],
    ["/faq", 0.6, "monthly"],
    ["/conseils/routine-peau-apres-la-mer", 0.6, "yearly"],
    ["/mentions-legales", 0.2, "yearly"],
    ["/confidentialite", 0.2, "yearly"],
    ["/cgv-bons-cadeaux", 0.2, "yearly"],
  ];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: `${siteUrl}${p}`, lastModified: now, changeFrequency, priority })),
    ...soins.map((s) => ({ url: `${siteUrl}/soins/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
