"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { Etape } from "@/data/soins";

gsap.registerPlugin(ScrollTrigger);

/** « 22–37 » → « 22 – 37 » ; « fin » → « fin ». */
const temps = (t: string) => t.replace(/(\d)\s*[–-]\s*(\d)/, "$1 – $2");

/**
 * Déroulé minute par minute. Desktop (≥ 1024 px, mouvement autorisé) :
 * la section est épinglée, une goutte descend le long du fil et allume
 * chaque étape à son passage ; le grand chiffre à gauche suit. Mobile et
 * mouvement réduit : une simple liste, tout est lisible d'emblée.
 */
export function Deroule({ etapes, titre, duree, intro }: { etapes: Etape[]; titre: string; duree: string; intro: string }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const drop = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const bigs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const lis = items.current.filter(Boolean) as HTMLLIElement[];
      const n = lis.length;
      let current = -1;
      const mark = (i: number) => {
        if (i === current) return;
        current = i;
        lis.forEach((li, k) => li.setAttribute("data-on", String(k === i)));
        bigs.current.forEach((b, k) => b?.setAttribute("data-on", String(k === i)));
      };
      mark(0);
      // Position verticale (px) du repère de chaque étape, dans la colonne.
      const stop = (i: number) => lis[i].offsetTop + 21;
      gsap.set(fill.current, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(drop.current, { y: stop(0) });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          // Si la section dépasse l'écran, on l'épingle par le bas pour garder tout le fil visible.
          start: () => (el.offsetHeight > window.innerHeight ? "bottom bottom" : "top top"),
          end: () => `+=${Math.max(n - 1, 1) * window.innerHeight * 0.42}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => mark(Math.round(self.progress * (n - 1))),
        },
      });
      for (let i = 1; i < n; i++) {
        tl.to(drop.current, { y: () => stop(i), duration: 1 }, i - 1);
      }
      tl.to(fill.current, { scaleY: 1, duration: Math.max(n - 1, 1) }, 0);

      const t = window.setTimeout(() => ScrollTrigger.refresh(), 1400);
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => {
        window.clearTimeout(t);
        lis.forEach((li) => li.removeAttribute("data-on"));
      };
    });
    return () => mm.revert();
  }, [etapes.length]);

  return (
    <div ref={root} className="shell relative overflow-hidden bg-prune px-5 py-16 text-lait sm:px-10 lg:flex lg:min-h-svh lg:items-center lg:px-16 lg:py-16">
      {/* Filet d'eau décoratif */}
      <svg aria-hidden viewBox="0 0 400 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-lait/[0.06]">
        <path d="M0 60 C 60 30, 120 90, 200 60 S 340 30, 400 60 L400 120 L0 120 Z" fill="currentColor" />
      </svg>

      <div className="relative grid w-full gap-12 lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5">
          <p className="eyebrow text-argile">Déroulé minute par minute</p>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,1.2rem+3.4vw,4.4rem)] font-light leading-[0.98] tracking-[-0.045em]">{titre}</h2>
          <p className="mt-5 max-w-[40ch] text-lait/75">{intro}</p>

          {/* Grand repère temporel (desktop) */}
          <div aria-hidden className="relative mt-12 hidden h-[clamp(6rem,3rem+6vw,10rem)] lg:motion-safe:block">
            {etapes.map((e, i) => (
              <span
                key={i}
                ref={(node) => {
                  bigs.current[i] = node;
                }}
                data-on={i === 0 ? "true" : "false"}
                className="tabular absolute left-0 top-0 flex items-baseline gap-3 whitespace-nowrap font-serif text-[clamp(4.5rem,2rem+6vw,9rem)] leading-none text-argile opacity-0 blur-[6px] transition-[opacity,filter,translate] duration-700 ease-[var(--ease-veil)] data-[on=false]:translate-y-3 data-[on=true]:opacity-100 data-[on=true]:blur-none"
              >
                {temps(e.temps)}
                {/\d/.test(e.temps) ? <span className="font-display text-lead font-light text-lait/60">min</span> : null}
              </span>
            ))}
          </div>
          <p className="mt-6 hidden text-caption text-lait/55 lg:motion-safe:block">Durée en cabine : {duree}. Faites défiler, la goutte suit le soin.</p>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7">
          {/* Fil + goutte */}
          <div ref={line} aria-hidden className="absolute bottom-3 left-[0.6875rem] top-3 w-px bg-lait/20">
            <div ref={fill} className="absolute inset-0 origin-top bg-argile/70" />
          </div>
          <div ref={drop} aria-hidden className="absolute left-0 top-0 hidden size-6 place-items-center lg:motion-safe:grid">
            <svg viewBox="0 0 24 24" className="size-6 -translate-y-1/2 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]">
              <path d="M12 2.5c3.6 4.5 6.1 8.2 6.1 11.4a6.1 6.1 0 1 1-12.2 0c0-3.2 2.5-6.9 6.1-11.4Z" fill="#D4A78F" />
              <path d="M9 14.6c.3 1.4 1.3 2.4 2.7 2.7" fill="none" stroke="#FFFFFF" strokeOpacity=".8" strokeLinecap="round" />
            </svg>
          </div>

          <ol className="relative space-y-7 lg:space-y-5">
            {etapes.map((e, i) => (
              <li
                key={i}
                ref={(node) => {
                  items.current[i] = node;
                }}
                className="group/etape grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-5 transition-opacity duration-500 ease-[var(--ease-veil)] data-[on=false]:opacity-35"
              >
                <span aria-hidden className="relative mt-[0.55rem] grid size-6 place-items-center">
                  <span className="size-2.5 rounded-full border border-lait/60 bg-prune transition-[background-color,scale] duration-500 group-data-[on=true]/etape:scale-125 group-data-[on=true]/etape:bg-argile" />
                </span>
                <div>
                  <p className="tabular font-serif text-[1.35rem] leading-tight text-argile">
                    {/\d/.test(e.temps) ? (
                      <>
                        {temps(e.temps)} <span className="font-sans text-caption text-lait/60">min</span>
                      </>
                    ) : (
                      "Pour finir"
                    )}
                  </p>
                  <p className="mt-1.5 max-w-[52ch] text-[1.02rem] leading-relaxed text-lait/90 lg:text-[0.98rem] lg:leading-normal">{e.geste}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
