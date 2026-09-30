"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { occasionDuMoment } from "@/data/bons-cadeaux";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { LineReveal } from "@/components/effects/LineReveal";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

type Occ = ReturnType<typeof occasionDuMoment>;

/**
 * Bons cadeaux — mis en avant automatiquement dans les semaines qui précèdent
 * la Saint-Valentin, la fête des mères et Noël (calcul sur la date réelle).
 */
export function Cadeaux() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [occ, setOcc] = useState<Occ | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOcc(occasionDuMoment(new Date())));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (reduced || !card.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        card.current,
        { rotateY: -32, rotateX: 10, rotateZ: -6 },
        { rotateY: 18, rotateX: -4, rotateZ: 4, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 } },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

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

        <div className="relative flex justify-center [perspective:1400px] lg:col-span-5 lg:col-start-8">
          <div ref={card} className="relative aspect-[1.6/1] w-full max-w-[520px] [transform-style:preserve-3d]">
            <div className="absolute inset-0 overflow-hidden rounded-[26px] bg-sable shadow-[0_40px_80px_-30px_rgba(59,42,51,0.45)] [backface-visibility:hidden]">
              <svg viewBox="0 0 520 325" className="absolute inset-0 size-full" aria-hidden>
                <ellipse cx="380" cy="262" rx="120" ry="30" fill="#3B2A33" opacity="0.08" />
                <path d="M270 250c0-28 50-46 108-46s102 17 102 42-46 38-106 38-104-9-104-34Z" fill="#C9A48A" />
                <path d="M306 196c0-22 36-37 78-37s74 14 74 33-32 30-76 30-76-8-76-26Z" fill="#9CAF9A" />
                <path d="M338 150c0-16 24-27 52-27s48 10 48 24-21 22-50 22-50-6-50-19Z" fill="#3B2A33" />
              </svg>
              <div className="absolute left-7 top-6 font-display text-[1.05rem] font-medium tracking-[0.3em] text-prune">BRUME</div>
              <div className="absolute bottom-6 left-7 text-prune">
                <p className="eyebrow text-prune-soft">Bon cadeau</p>
                <p className="mt-1 font-serif text-[2.6rem] leading-none">80 €</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
