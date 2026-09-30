"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { espaces } from "@/data/institut";
import { Matiere } from "@/components/ui/Matiere";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

/**
 * L'espace — parallaxe de profondeur sur trois plans : les matières (lin,
 * argile, eau) glissent à des vitesses différentes, les textes flottent entre.
 */
export function Espace() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        const depth = Number(el.dataset.depth);
        gsap.fromTo(
          el,
          { yPercent: depth * 18 },
          { yPercent: -depth * 18, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
      });
      gsap.from("[data-espace-title] > span", {
        yPercent: 110,
        stagger: 0.08,
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-espace-title]", start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const layout = [
    { wrap: "lg:col-span-5 lg:row-span-2", visual: "aspect-[4/5]", depth: 0.6 },
    { wrap: "lg:col-span-4 lg:col-start-8 lg:mt-40", visual: "aspect-[5/4]", depth: 1.4 },
    { wrap: "lg:col-span-4 lg:col-start-6 lg:-mt-10", visual: "aspect-[1/1]", depth: 1 },
  ];

  return (
    <section ref={root} aria-labelledby="espace-title" className="shell relative overflow-hidden bg-lait px-5 py-20 sm:px-10 lg:px-16 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-argile-deep">L&apos;espace</p>
          <h2 id="espace-title" data-espace-title className="mt-5 overflow-hidden font-display text-[clamp(2.25rem,1.2rem+3.4vw,4.75rem)] font-light leading-[1] tracking-[-0.045em]">
            <span className="block">Trois pièces,</span>
            <span className="block text-prune-soft">et le silence entre elles.</span>
          </h2>
        </div>
        <p className="self-end text-lead text-prune-soft lg:col-span-4 lg:col-start-9">
          Enduits à la chaux, lin, bois clair. Pas de musique d&apos;ascenseur&nbsp;: une playlist douce, ou le silence si vous le demandez.
        </p>
      </div>

      <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
        {espaces.map((e, i) => (
          <article key={e.id} className={cn("relative", layout[i].wrap)}>
            <div data-depth={layout[i].depth} className="will-change-transform">
              <div className="overflow-hidden rounded-[var(--radius-card)]">
                <Matiere kind={e.matiere} className={cn("w-full", layout[i].visual)} label={`${e.titre} de l'institut BRUME à Balaruc-les-Bains`} />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[1.5rem] font-light tracking-[-0.03em]">{e.titre}</h3>
                <span className="font-serif text-[1.15rem] text-argile-deep">{e.chiffre}</span>
              </div>
              <p className="mt-2 max-w-[44ch] text-prune-soft">{e.texte}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 flex justify-end lg:-mt-6">
        <Button href="/institut" variant="outline" icon="fleche">
          Visiter l&apos;institut
        </Button>
      </div>
    </section>
  );
}
