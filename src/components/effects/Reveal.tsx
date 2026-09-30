"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

/**
 * Révélation au clip-path, depuis le bas / la gauche / le centre, coins
 * arrondis préservés. L'élément garde sa classe (grille, flex…) : il est
 * observé par une marge de détection négative plutôt qu'à clip nul, car un
 * élément entièrement découpé n'intersecte jamais.
 */
export function ClipReveal({ children, className, delay = 0, from = "bottom" }: { children: ReactNode; className?: string; delay?: number; from?: "bottom" | "left" | "center" }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const hidden =
    from === "left" ? "inset(0% 99.5% 0% 0% round 28px)" : from === "center" ? "inset(40% 40% 40% 40% round 999px)" : "inset(99.5% 0% 0% 0% round 28px)";
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? { opacity: 0 } : { clipPath: hidden }}
      animate={inView ? (reduced ? { opacity: 1 } : { clipPath: "inset(-12% -12% -12% -12% round 0px)" }) : undefined}
      transition={{ duration: reduced ? 0.4 : 1.3, delay, ease: ease.tide }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Révélation « par ondulation » : un filtre SVG de déplacement (turbulence)
 * dont l'amplitude retombe à zéro, comme une surface d'eau qui se calme.
 */
export function RippleReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  const scale = useMotionValue(reduced ? 0 : 90);
  const opacity = useMotionValue(0);
  const scaleAttr = useTransform(scale, (v) => v.toFixed(1));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const a = animate(opacity, 1, { duration: reduced ? 0.4 : 0.9, delay, ease: ease.float });
    const b = reduced
      ? undefined
      : animate(scale, 0, { duration: 2.2, delay, ease: ease.veil, onComplete: () => setDone(true) });
    return () => {
      a.stop();
      b?.stop();
    };
  }, [inView, reduced, delay, opacity, scale]);

  return (
    <motion.div ref={ref} className={cn("relative", className)} style={{ opacity, filter: done || reduced ? undefined : `url(#rip-${id})` }}>
      <svg className="pointer-events-none absolute size-0" aria-hidden>
        <filter id={`rip-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" />
          <motion.feDisplacementMap in="SourceGraphic" scale={scaleAttr} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {children}
    </motion.div>
  );
}

/** Compteur qui monte quand il entre à l'écran. */
export function Counter({ to, className, duration = 1.6, suffix = "" }: { to: number; className?: string; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduced = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setVal(to));
      return () => cancelAnimationFrame(id);
    }
    const c = animate(0, to, { duration, ease: ease.veil, onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, duration, reduced]);
  return (
    <span ref={ref} className={cn("tabular", className)}>
      {val.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/** Fondu flottant simple, utilisé avec parcimonie. */
export function Float({ children, className, delay = 0, y = 24 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, delay, ease: ease.veil }}
    >
      {children}
    </motion.div>
  );
}
