"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";
import { Counter } from "@/components/effects/Reveal";

/** Filet qui se trace de gauche à droite à l'entrée dans l'écran. */
export function Trace({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px origin-left bg-[var(--color-ligne)]", className)}
      initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
      whileInView={reduced ? { opacity: 1 } : { scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 1.4, delay, ease: ease.tide }}
    />
  );
}

/** Contenu qui glisse depuis la gauche en suivant le filet. */
export function Glisse({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1, delay, ease: ease.veil }}
    >
      {children}
    </motion.div>
  );
}

/** Parallaxe douce : l'enfant se déplace moins vite que la page. */
export function Parallaxe({ children, className, amplitude = 60 }: { children: ReactNode; className?: string; amplitude?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [amplitude, -amplitude]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="size-full">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Montant animé en compteur, mais lisible tel quel par les lecteurs d'écran
 * et les robots (le compteur part de 0 tant qu'il n'est pas à l'écran).
 */
export function MontantAnime({ valeur, className }: { valeur: number; className?: string }) {
  return (
    <span className={className}>
      <span aria-hidden>
        <Counter to={valeur} suffix={" €"} />
      </span>
      <span className="sr-only">{`${valeur.toLocaleString("fr-FR")} €`}</span>
    </span>
  );
}
