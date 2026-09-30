import type { Metadata } from "next";
import { Hero } from "@/sections/home/Hero";
import { Promesse } from "@/sections/home/Promesse";
import { Quiz } from "@/sections/home/Quiz";
import { Carte } from "@/sections/home/Carte";
import { Espace } from "@/sections/home/Espace";
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
      <Quiz />
      <Carte />
      <Espace />
      <Cadeaux />
      <Praticiennes />
      <Avis />
      <Reserver />
    </div>
  );
}
