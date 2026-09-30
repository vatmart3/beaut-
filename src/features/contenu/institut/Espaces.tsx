"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Matiere } from "@/components/ui/Matiere";
import { LineReveal } from "@/components/effects/LineReveal";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import type { Matiere as MatiereId } from "@/data/soins";

export interface EspaceItem {
  id: string;
  titre: string;
  texte: string;
  chiffre: string;
  matiere: MatiereId;
}

/**
 * Un espace, trois plans : la matière au fond (lente), le texte (moyen),
 * le galet-chiffre au premier plan (rapide, en sens inverse).
 */
export function EspaceRow({ espace, index, children }: { espace: EspaceItem; index: number; children?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yFond = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-9%", "9%"]);
  const yGalet = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["60%", "-60%"]);
  const yTexte = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["10%", "-10%"]);
  const pair = index % 2 === 1;

  return (
    <article ref={ref} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
      <div className={cn("relative lg:col-span-6", pair ? "lg:order-2 lg:col-start-7" : "lg:col-start-1")}>
        <motion.div
          className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] sm:aspect-[5/4] lg:aspect-[4/5]"
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(12% 12% 12% 12% round 200px)" }}
          whileInView={reduced ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0% round 28px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: ease.tide }}
        >
          <motion.div className="absolute inset-x-0 -inset-y-[10%]" style={{ y: yFond }}>
            <Matiere kind={espace.matiere} className="size-full" label={`Matière évoquant ${espace.titre.toLowerCase()}`} />
          </motion.div>
        </motion.div>
        <motion.div
          style={{ y: yGalet }}
          className={cn(
            "galet absolute -bottom-6 grid aspect-[6/5] w-36 place-items-center bg-ecume px-3 text-center shadow-[var(--shadow-galet)] sm:w-44",
            pair ? "-left-2 sm:-left-6" : "-right-2 sm:-right-6",
          )}
        >
          <span className="font-serif text-[1.35rem] leading-tight sm:text-[1.6rem]">{espace.chiffre}</span>
        </motion.div>
      </div>
      <motion.div style={{ y: yTexte }} className={cn("lg:col-span-5", pair ? "lg:order-1 lg:col-start-1" : "lg:col-start-8")}>
        <p className="tabular font-serif text-[1rem] text-argile-deep">{String(index + 1).padStart(2, "0")}</p>
        <LineReveal as="h3" text={espace.titre} className="mt-2 font-display text-[clamp(1.9rem,1.3rem+2.2vw,3.25rem)] font-light leading-[1.02] tracking-[-0.035em]" />
        <p className="mt-5 max-w-[46ch] text-lead leading-relaxed text-prune-soft">{espace.texte}</p>
        {children}
      </motion.div>
    </article>
  );
}
