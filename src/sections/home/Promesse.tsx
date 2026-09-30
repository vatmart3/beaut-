"use client";

import { Photo } from "@/components/ui/Photo";
import type { PhotoId } from "@/data/photos";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RippleCanvas } from "@/components/effects/RippleCanvas";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { dropState } from "./dropState";

const phrase = ["Un", "soin", "de", "@regard", "soixante", "minutes,", "ce", "sont", "soixante", "minutes", "de", "mains", "@levres", "sur", "votre", "peau."];

const chiffres = [
  { n: "60", label: "minutes de soin, c'est 60 minutes de mains sur votre peau" },
  { n: "20", label: "minutes de tisanerie offertes après chaque soin" },
  { n: "15", label: "minutes entre deux rendez-vous, pour ne jamais courir" },
];

/**
 * La goutte du hero touche la surface : une onde (shader) part du point
 * d'impact et la section se révèle en cercle depuis ce même point.
 */
export function Promesse() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const reduced = useReducedMotion();
  const [trigger, setTrigger] = useState(0);
  const [origin, setOrigin] = useState(0.88);

  useEffect(() => {
    if (!inView) return;
    const id = requestAnimationFrame(() => {
      setOrigin(dropState.x);
      setTrigger((t) => t + 1);
    });
    return () => cancelAnimationFrame(id);
  }, [inView]);

  return (
    // L'observateur est posé sur un conteneur non découpé : un élément à clip-path nul n'intersecte jamais.
    <div ref={ref}>
    <motion.section
      aria-labelledby="promesse-title"
      className="shell relative overflow-hidden px-5 pb-20 pt-24 sm:px-10 lg:px-16 lg:pb-28 lg:pt-36"
      initial={reduced ? { opacity: 0 } : { clipPath: `circle(0% at ${origin * 100}% 0%)` }}
      animate={
        inView
          ? reduced
            ? { opacity: 1 }
            : { clipPath: `circle(160% at ${origin * 100}% 0%)` }
          : undefined
      }
      transition={{ duration: 2.1, ease: ease.tide }}
    >
      <RippleCanvas trigger={trigger} origin={{ x: origin, y: 0 }} duration={3} strength={1.1} shadow="#D4A78F" className="z-0" />

      <p className="eyebrow relative z-[1] text-argile-deep">La promesse</p>
      <h2
        id="promesse-title"
        className="relative z-[1] mt-8 max-w-[18ch] font-display text-[clamp(2.2rem,0.9rem+4.6vw,6.6rem)] font-light leading-[1.02] tracking-[-0.05em] lg:max-w-none"
      >
        <span className="sr-only">Un soin de soixante minutes, ce sont soixante minutes de mains sur votre peau.</span>
        <motion.span
          aria-hidden
          className="block"
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          transition={{ staggerChildren: reduced ? 0 : 0.05, delayChildren: 0.6 }}
        >
          {phrase.map((tok, i) =>
            tok.startsWith("@") ? (
              <motion.span
                key={i}
                className="relative mx-[0.12em] inline-block h-[0.78em] w-[1.9em] translate-y-[0.06em] overflow-hidden rounded-full align-baseline"
                variants={{ hidden: { scale: reduced ? 1 : 0.4, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { duration: 1, ease: ease.veil } } }}
              >
                <Photo id={tok.slice(1) as PhotoId} alt="" sizes="240px" />
              </motion.span>
            ) : (
              <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                  className="inline-block"
                  variants={{ hidden: { y: reduced ? 0 : "105%", opacity: reduced ? 0 : 1 }, show: { y: "0%", opacity: 1, transition: { duration: 1.1, ease: ease.veil } } }}
                >
                  {tok}&nbsp;
                </motion.span>
              </span>
            ),
          )}
        </motion.span>
      </h2>

      <div className="relative z-[1] mt-16 grid gap-3 sm:grid-cols-3 lg:mt-24">
        {chiffres.map((c, i) => (
          <motion.div
            key={c.label}
            className="flex items-baseline gap-4 rounded-[24px] border hairline bg-white/70 p-6 backdrop-blur"
            initial={{ opacity: 0, y: reduced ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, delay: 0.1 * i, ease: ease.veil }}
          >
            <span className="font-serif text-[3rem] leading-none">{c.n}</span>
            <span className="text-[0.95rem] text-prune-soft">{c.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
    </div>
  );
}
