"use client";

import { Photo } from "@/components/ui/Photo";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { use3DCapable, useCoarsePointer, useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

const SerumBottle = dynamic(() => import("@/components/three/SerumBottle"), { ssr: false });

const etapes = [
  {
    n: "01",
    titre: "Lire la peau",
    texte: "Loupe lumineuse, quelques questions sur votre routine. Quinze minutes pour comprendre votre peau avant de la toucher.",
    photo: "visageSerre" as const,
    legende: "Diagnostic · 15 min",
  },
  {
    n: "02",
    titre: "Nourrir en profondeur",
    texte: "Double nettoyage, exfoliation enzymatique, sérum à l'acide hyaluronique en deux poids moléculaires.",
    photo: "peau" as const,
    legende: "Protocole · 30 min",
  },
  {
    n: "03",
    titre: "Sceller l'éclat",
    texte: "Masque occlusif sous compresses tièdes, modelage en pressions glissées. Vous repartez la peau souple, sans brillance.",
    photo: "levres" as const,
    legende: "Rituel · 15 min",
  },
];

/**
 * Protocole signature — section épinglée : le flacon de sérum 3D tourne au
 * scroll pendant que les trois temps du soin se succèdent.
 */
export function Signature() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const capable = use3DCapable();
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress.current = self.progress;
        setStep(Math.min(2, Math.floor(self.progress * 3)));
      },
    });
    return () => st.kill();
  }, [reduced]);

  const e = etapes[step];

  return (
    <section ref={root} aria-labelledby="signature-title" className={cn("relative", reduced ? "" : "h-[300vh]")}>
      <div className={cn("shell relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_40%,#F6EAE2_0%,#EBD3C5_55%,#DDBBA8_100%)]", reduced ? "" : "sticky top-3 h-[calc(100svh-1.5rem)]")}>
        {/* grand chiffre en fond */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={e.n}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(14rem,40vw,42rem)] font-light leading-none tracking-[-0.08em] text-white/45"
            initial={{ opacity: 0, y: 80, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -80, filter: "blur(12px)" }}
            transition={{ duration: 0.9, ease: ease.veil }}
          >
            {e.n}
          </motion.span>
        </AnimatePresence>

        {/* flacon */}
        <div className="absolute inset-x-0 top-[36%] bottom-[20%] mx-auto w-[min(92vw,560px)] lg:top-[6%] lg:bottom-[6%]">
          {capable ? <SerumBottle progress={progress} host={root} lite={coarse} /> : <BottleFallback />}
        </div>

        <div className="relative z-10 grid h-full grid-rows-[auto_1fr_auto] px-5 pb-8 pt-24 sm:px-10 lg:grid-cols-12 lg:grid-rows-1 lg:px-16 lg:py-16">
          <div className="lg:col-span-4 lg:self-center">
            <p className="eyebrow text-argile-deep">Le protocole signature</p>
            <h2 id="signature-title" className="mt-4 font-display text-[clamp(2rem,1.2rem+2.8vw,4rem)] font-light leading-[0.98] tracking-[-0.045em]">
              Hydratation profonde, en trois temps.
            </h2>
            <div className="relative mt-6 hidden min-h-[9rem] lg:block" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={e.n}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: ease.veil }}
                >
                  <p className="font-serif text-[1.1rem] text-argile-deep">{e.n}</p>
                  <h3 className="mt-1 font-display text-[1.6rem] tracking-[-0.03em]">{e.titre}</h3>
                  <p className="mt-2 max-w-[34ch] text-prune-soft">{e.texte}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-8 hidden gap-2 lg:flex">
              {etapes.map((x, i) => (
                <span key={x.n} className="h-1 w-12 overflow-hidden rounded-full bg-white/60">
                  <span className={cn("block h-full rounded-full bg-prune transition-[width] duration-700 ease-[var(--ease-veil)]", i <= step ? "w-full" : "w-0")} />
                </span>
              ))}
            </div>
          </div>

          {/* carte flottante (verre) */}
          <div className="relative lg:col-span-4 lg:col-start-9 lg:self-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={e.n}
                className="ml-auto flex w-full max-w-[360px] items-center gap-4 rounded-[24px] border border-white/70 bg-white/55 p-3 shadow-[0_30px_60px_-30px_rgba(34,27,29,0.45)] backdrop-blur-xl max-lg:absolute max-lg:bottom-0 max-lg:right-0"
                initial={{ opacity: 0, x: 40, rotate: 3 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -30, rotate: -2 }}
                transition={{ duration: 0.7, ease: ease.veil }}
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-[16px] sm:size-24">
                  <Photo id={e.photo} alt="" sizes="120px" />
                </div>
                <figcaption className="min-w-0">
                  <p className="text-[0.8rem] text-prune-soft">{e.legende}</p>
                  <p className="font-display text-[1.15rem] leading-tight tracking-[-0.02em]">{e.titre}</p>
                  <p className="mt-1 text-[0.85rem] text-prune-soft lg:hidden">{e.texte}</p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <div className="mt-6 hidden justify-end lg:flex">
              <Button href="/soins/hydratation-profonde" variant="solid" icon="fleche">
                Le soin · 60 min · 79 €
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BottleFallback() {
  return (
    <svg viewBox="0 0 200 320" className="mx-auto h-full w-auto" aria-hidden>
      <defs>
        <linearGradient id="bf-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="bf-liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EFC3AA" />
          <stop offset="1" stopColor="#D9A084" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="300" rx="62" ry="8" fill="#6b4a3c" opacity="0.18" />
      <rect x="80" y="18" width="40" height="46" rx="20" fill="#221B1D" />
      <rect x="76" y="62" width="48" height="16" rx="3" fill="#CFC5BF" />
      <path d="M86 78h28v14c26 6 40 18 40 40v150a14 14 0 0 1-14 14H60a14 14 0 0 1-14-14V132c0-22 14-34 40-40Z" fill="url(#bf-glass)" stroke="#fff" strokeOpacity="0.9" />
      <path d="M52 170h96v112a10 10 0 0 1-10 10H62a10 10 0 0 1-10-10Z" fill="url(#bf-liq)" opacity="0.9" />
      <rect x="62" y="190" width="76" height="46" rx="4" fill="#fff" opacity="0.9" />
      <text x="100" y="214" textAnchor="middle" fontSize="13" letterSpacing="3" fill="#221B1D">BRUME</text>
      <text x="100" y="228" textAnchor="middle" fontSize="6" letterSpacing="1.5" fill="#5F5457">SÉRUM · 30 ML</text>
    </svg>
  );
}
