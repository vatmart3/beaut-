"use client";

import { useEffect, useRef, useState } from "react";
import { CardPreview } from "@/features/bons-cadeaux/CardPreview";
import type { CardData } from "@/features/bons-cadeaux/cardArt";
import { occasionDuMoment } from "@/data/bons-cadeaux";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { LineReveal } from "@/components/effects/LineReveal";
import { cn } from "@/lib/cn";

const demoCarte: CardData = {
  motif: "galets",
  titre: "80 €",
  detail: "Montant libre, utilisable en plusieurs fois",
  estSoin: false,
  de: "Julie",
  pour: "Maman",
  message: "Une heure rien qu'à toi, et la tisane après.",
  code: "BRM-EXEM-PLE2",
  validite: "valable 12 mois",
};

type Occ = ReturnType<typeof occasionDuMoment>;

/**
 * Bons cadeaux — mis en avant automatiquement dans les semaines qui précèdent
 * la Saint-Valentin, la fête des mères et Noël (calcul sur la date réelle).
 */
export function Cadeaux() {
  const root = useRef<HTMLElement>(null);
  const [occ, setOcc] = useState<Occ | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOcc(occasionDuMoment(new Date())));
    return () => cancelAnimationFrame(id);
  }, []);


  const active = occ?.active;
  const dateLabel = occ?.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <section
      ref={root}
      aria-labelledby="cadeaux-title"
      className={cn("shell relative overflow-hidden px-5 py-20 sm:px-10 lg:px-16 lg:py-28", active ? "bg-prune text-lait" : "bg-argile-pale")}
    >
      <div className="grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className={cn("eyebrow", active ? "text-argile" : "text-argile-deep")}>
            {active && occ ? `${occ.o.label} · ${dateLabel}` : "Bons cadeaux"}
          </p>
          <LineReveal
            as="h2"
            id="cadeaux-title"
            text={active && occ ? occ.o.phrase + "." : "Offrir une heure, pas un objet."}
            className="mt-5 font-display text-[clamp(2.25rem,1.2rem+3.4vw,4.75rem)] font-light leading-[0.98] tracking-[-0.045em]"
          />
          <p className={cn("mt-6 max-w-[46ch] text-lead", active ? "text-lait/80" : "text-prune-soft")}>
            Montant libre ou soin précis, message écrit par vous, trois motifs de carte. À imprimer tout de suite, ou envoyé par e-mail le jour que
            vous choisissez.
            {occ && active ? ` Il reste ${occ.jours} jour${occ.jours > 1 ? "s" : ""} : l'envoi programmé arrive pile à l'heure.` : null}
          </p>
          <ul className={cn("mt-8 grid gap-2 text-[0.95rem] sm:grid-cols-2", active ? "text-lait/85" : "text-prune")}>
            <li>— Valable {site.policies.giftValidityMonths} mois</li>
            <li>— Échangeable contre un autre soin</li>
            <li>— Code unique et date sur le bon</li>
            <li>— Retrait possible à l&apos;institut</li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/bons-cadeaux" variant={active ? "lait" : "solid"} size="lg" icon="cadeau">
              Composer un bon cadeau
            </Button>
            <Button href="/bons-cadeaux?soin=rituel-duo-bassin-de-thau" variant={active ? "ghost" : "outline"} size="lg" className={active ? "text-lait hover:bg-lait/10" : undefined}>
              Offrir le rituel duo
            </Button>
          </div>
          {occ && !active ? (
            <p className="mt-6 text-[0.875rem] text-prune-mute">
              Prochaine occasion&nbsp;: {occ.o.label.toLowerCase()}, le {dateLabel}.
            </p>
          ) : null}
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7">
          <CardPreview
            data={demoCarte}
            description="Aperçu d'un bon cadeau BRUME de 80 euros, motif galets, à retourner pour lire le message."
            className="mx-auto w-full max-w-[620px]"
          />
        </div>
      </div>
    </section>
  );
}
