"use client";

import { Photo } from "@/components/ui/Photo";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { espaces, hygiene } from "@/data/institut";
import { Matiere } from "@/components/ui/Matiere";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/device";

gsap.registerPlugin(ScrollTrigger);

/**
 * L'institut en galerie horizontale : la section s'épingle et les pièces
 * défilent de droite à gauche au scroll (desktop). Défilement natif avec
 * aimantation sur mobile et en mouvement réduit.
 */
export function Galerie() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || reduced || !wide) return;
    const ctx = gsap.context(() => {
      const distance = () => tr.scrollWidth - el.clientWidth;
      gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top+=12", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-par]").forEach((img) => {
        gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: true } });
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, wide]);

  const visuels: Record<string, React.ReactNode> = {
    "cabine-duo": <Matiere kind="lin" className="size-full" label="Cabine duo de l'institut BRUME, lin et enduit à la chaux" />,
    "cabine-soin": <Photo id="visage" focal="50% 44%" alt="Soin visage dans la cabine de l'institut BRUME à Balaruc-les-Bains" sizes="(min-width:1024px) 40vw, 80vw" />,
    tisanerie: <Matiere kind="eau" className="size-full" label="Tisanerie de l'institut BRUME" />,
  };

  return (
    <section ref={root} aria-labelledby="galerie-title" className="shell overflow-hidden bg-lait">
      <div
        ref={track}
        className="flex h-auto w-full snap-x snap-mandatory gap-4 overflow-x-auto px-5 py-16 [scrollbar-width:none] sm:px-10 lg:h-[calc(100svh-1.5rem)] lg:w-max lg:snap-none lg:items-center lg:gap-8 lg:overflow-visible lg:px-16 lg:py-0"
      >
        <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-center sm:w-[60vw] lg:w-[34vw]">
          <p className="eyebrow text-argile-deep">L&apos;institut</p>
          <h2 id="galerie-title" className="mt-4 font-display text-[clamp(2.4rem,1.2rem+4vw,5.5rem)] font-light leading-[0.95] tracking-[-0.05em]">
            Trois pièces, et le silence entre elles.
          </h2>
          <p className="mt-6 max-w-[34ch] text-lead text-prune-soft">Enduits à la chaux, lin, bois clair. À quatre minutes à pied des thermes de Balaruc-les-Bains.</p>
        </div>

        {espaces.map((e, i) => (
          <article key={e.id} className="relative w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-[38vw]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] lg:aspect-auto lg:h-[68svh]">
              <div data-par className="absolute -inset-x-[10%] inset-y-0">
                {visuels[e.id]}
              </div>
              <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/60 px-4 py-2 font-serif text-[1rem] backdrop-blur-md">{e.chiffre}</span>
            </div>
            <div className="mt-5 flex items-baseline gap-4">
              <span className="font-serif text-[1.1rem] text-argile-deep">0{i + 1}</span>
              <div>
                <h3 className="font-display text-[1.6rem] font-light tracking-[-0.03em]">{e.titre}</h3>
                <p className="mt-1 max-w-[42ch] text-prune-soft">{e.texte}</p>
              </div>
            </div>
          </article>
        ))}

        <article className="flex w-[82vw] shrink-0 snap-start flex-col justify-between rounded-[28px] bg-prune p-8 text-lait sm:w-[60vw] lg:h-[68svh] lg:w-[30vw] lg:p-10">
          <div>
            <p className="eyebrow text-argile">Ce que vous ne voyez pas</p>
            <ul className="mt-6 space-y-4">
              {hygiene.slice(0, 4).map((h) => (
                <li key={h.titre} className="border-b border-lait/15 pb-4">
                  <p className="font-display text-[1.15rem]">{h.titre}</p>
                  <p className="mt-1 text-[0.9rem] text-lait/70">{h.texte}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <Button href="/institut" variant="lait" icon="fleche">
              Visiter l&apos;institut
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
