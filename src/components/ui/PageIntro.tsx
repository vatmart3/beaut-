import { Photo } from "./Photo";
import type { PhotoId } from "@/data/photos";
import type { ReactNode } from "react";
import { LineReveal } from "@/components/effects/LineReveal";
import { ClipReveal } from "@/components/effects/Reveal";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "./Breadcrumbs";

/** Photo d'en-tête par rubrique (point focal adapté au cadre). */
const visuels: Record<string, Visuel> = {
  "/soins": { id: "visage", focal: "50% 45%", alt: "Teint lumineux après un soin visage à Balaruc-les-Bains", pill: "17 soins, faits à la main" },
  "/rituels": { id: "visage", focal: "50% 80%", alt: "Cou et épaules détendus après une cure de modelages", pill: "Jusqu'à 70 € d'économie" },
  "/bons-cadeaux": { id: "visage", focal: "50% 60%", alt: "Bon cadeau soin visage à offrir", pill: "Valable 12 mois" },
  "/institut": { id: "peau", alt: "Soin visage à l'institut BRUME, quartier thermal de Balaruc-les-Bains", pill: "2 praticiennes · 1 cabine duo" },
  "/reserver": { id: "visageSerre", alt: "Réserver un soin à l'institut BRUME", pill: "Confirmation sous 24 h" },
  "/faq": { id: "visage", focal: "50% 42%", alt: "Peau souple et hydratée", pill: "Avant votre premier soin" },
  "/infos-pratiques": { id: "visage", focal: "50% 50%", alt: "Institut BRUME, 4 rue des Sources à Balaruc-les-Bains", pill: "4 min à pied des thermes" },
  "/conseils/routine-peau-apres-la-mer": { id: "epaules", alt: "Peau après une journée de mer sur le Bassin de Thau", pill: "Fiche offerte" },
};

type Visuel = { id: PhotoId; focal?: string; alt: string; pill: string };

/**
 * En-tête des pages internes, dans l'esprit du hero : coquille blanche,
 * grand titre (h1) qui monte sous masque, photo arrondie à droite avec une
 * pastille en verre.
 */
export function PageIntro({
  eyebrow,
  title,
  lead,
  crumbs,
  aside,
  className,
  image,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  crumbs: { name: string; path: string }[];
  aside?: ReactNode;
  className?: string;
  /** `null` pour ne pas afficher de photo ; par défaut, la photo de la rubrique. */
  image?: Visuel | null;
}) {
  const v = image === undefined ? (crumbs.length === 1 ? visuels[crumbs[0].path] : undefined) : image ?? undefined;
  return (
    <section className={cn("shell relative overflow-hidden px-5 pb-12 pt-28 sm:px-10 sm:pt-36 lg:px-16 lg:pb-16", className)}>
      <div className={cn("grid gap-12", v && "lg:grid-cols-12 lg:gap-10")}>
        <div className={cn(v && "lg:col-span-7")}>
          <Breadcrumbs items={crumbs} />
          <p className="eyebrow mt-10 text-argile-deep">{eyebrow}</p>
          <LineReveal
            as="h1"
            text={title}
            className={cn(
              "mt-4 font-display font-light leading-[0.95] tracking-[-0.05em]",
              v ? "max-w-[14ch] text-[clamp(2.75rem,1.2rem+5vw,7rem)]" : "max-w-[16ch] text-[clamp(2.75rem,1.2rem+6.2vw,8.5rem)]",
            )}
          />
          <div className={cn("mt-10 grid gap-10", !v && "lg:grid-cols-12")}>
            {lead ? <div className={cn("text-lead text-prune-soft", !v && "lg:col-span-5 lg:col-start-7")}>{lead}</div> : null}
            {aside ? <div className={cn(!v && "lg:col-span-5 lg:col-start-1 lg:row-start-1")}>{aside}</div> : null}
          </div>
        </div>
        {v ? (
          <ClipReveal className="relative lg:col-span-5" delay={0.2}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-sable max-lg:aspect-[16/11]">
              <Photo id={v.id} focal={v.focal} alt={v.alt} preload sizes="(min-width: 1024px) 36vw, 90vw" className="motion-safe:animate-breathe" />
              <span className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/65 px-4 py-2 font-display text-[0.85rem] backdrop-blur-md">
                {v.pill}
              </span>
            </div>
          </ClipReveal>
        ) : null}
      </div>
    </section>
  );
}
