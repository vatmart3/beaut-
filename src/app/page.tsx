import type { Metadata } from "next";
import { Hero } from "@/sections/home/Hero";
import { Promesse } from "@/sections/home/Promesse";
import { Marquee } from "@/sections/home/Marquee";
import { Signature } from "@/sections/home/Signature";
import { Bento } from "@/sections/home/Bento";
import { Quiz } from "@/sections/home/Quiz";
import { Galerie } from "@/sections/home/Galerie";
import { Cadeaux } from "@/sections/home/Cadeaux";
import { Praticiennes } from "@/sections/home/Praticiennes";
import { Avis } from "@/sections/home/Avis";
import { Reserver } from "@/sections/home/Reserver";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Institut de beauté à Balaruc-les-Bains · BRUME",
  description:
    "Soins visage, gommages au sel, enveloppements à l'argile, modelages et rituels duo à Balaruc-les-Bains, près de Sète. Réservation en ligne en 3 étapes.",
  path: "/",
});

export default function Home() {
  return (
    <div className="frame space-y-3 pt-3">
      <Hero />
      <Promesse />
      <Marquee />
      <Signature />
      <Bento />
      <Quiz />
      <Galerie />
      <Cadeaux />
      <Praticiennes />
      <Avis />
      <Reserver />
    </div>
  );
}
