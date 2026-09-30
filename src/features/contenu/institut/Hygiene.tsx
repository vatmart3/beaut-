"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/device";

/**
 * Le protocole d'hygiène comme une séquence : un fil se dessine au
 * défilement et allume chaque étape quand il l'atteint.
 */
export function HygieneSequence({ etapes }: { etapes: { titre: string; texte: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const progress = reduced ? scrollYProgress : smooth;
  const n = etapes.length;

  return (
    <ol ref={ref} className="relative">
      {/* Le fil */}
      <span aria-hidden className="absolute bottom-10 left-[1.45rem] top-6 w-px bg-prune/12 sm:left-[1.95rem]">
        <motion.span className="absolute inset-0 origin-top bg-argile-deep" style={{ scaleY: reduced ? 1 : progress }} />
      </span>
      {etapes.map((e, i) => (
        <Etape key={e.titre} etape={e} index={i} seuil={n === 1 ? 0 : i / (n - 1)} progress={progress} reduced={reduced} />
      ))}
    </ol>
  );
}

function Etape({
  etape,
  index,
  seuil,
  progress,
  reduced,
}: {
  etape: { titre: string; texte: string };
  index: number;
  seuil: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const a = Math.max(0, seuil - 0.08);
  const on = useTransform(progress, [a, seuil + 0.001], [0, 1]);
  const bg = useTransform(on, [0, 1], ["rgb(255 253 250)", "rgb(59 42 51)"]);
  const fg = useTransform(on, [0, 1], ["rgb(59 42 51)", "rgb(250 246 241)"]);
  const texte = useTransform(on, [0, 1], [0.35, 1]);
  const x = useTransform(on, [0, 1], [18, 0]);

  return (
    <li className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-5 pb-12 last:pb-0 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-8">
      <motion.span
        aria-hidden
        className={cn("relative z-[1] grid size-12 place-items-center rounded-full border border-prune/25 font-serif text-[1.05rem] sm:size-16 sm:text-[1.3rem]")}
        style={reduced ? undefined : { backgroundColor: bg, color: fg }}
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>
      <motion.div style={reduced ? undefined : { opacity: texte, x }} className="pt-2 sm:pt-4">
        <h3 className="font-display text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] font-light leading-tight">
          <span className="sr-only">Étape {index + 1} : </span>
          {etape.titre}
        </h3>
        <p className="mt-2 max-w-[54ch] text-prune-soft">{etape.texte}</p>
      </motion.div>
    </li>
  );
}
