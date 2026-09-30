"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { categories, soins, prixDepart, formatPrix } from "@/data/soins";
import { RippleCanvas } from "@/components/effects/RippleCanvas";
import { LineReveal } from "@/components/effects/LineReveal";
import { Icon } from "@/components/icons/Icon";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { dropState } from "./dropState";

const familles = categories.map((c) => {
  const list = soins.filter((s) => s.categorie === c.id);
  return { ...c, nombre: list.length, depuis: Math.min(...list.map(prixDepart)) };
});

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
      <RippleCanvas trigger={trigger} origin={{ x: origin, y: 0 }} duration={3} strength={1.1} shadow="#C9A48A" className="z-0" />

      <div className="relative z-[1] grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow text-argile-deep">La promesse</p>
          <LineReveal
            as="h2"
            text="Un soin de soixante minutes, ce sont soixante minutes de mains sur votre peau."
            className="mt-6 font-display text-[clamp(2rem,1rem+3.6vw,5rem)] font-light leading-[1.02] tracking-[-0.04em]"
            id="promesse-title"
            delay={0.5}
          />
        </div>
        <div className="flex flex-col justify-end gap-6 text-lead text-prune-soft lg:col-span-4 lg:pb-3">
          <p>
            L&apos;accueil, la tisane et le temps de vous rhabiller ne sont pas décomptés. Nous prévoyons quinze minutes entre deux rendez-vous
            pour ne jamais courir.
          </p>
        </div>
      </div>

      <div id="familles" className="relative z-[1] mt-20 lg:mt-28">
        <p className="eyebrow mb-6 text-prune-mute">Cinq familles de soins</p>
        <ol className="border-t hairline">
          {familles.map((f, i) => (
            <motion.li
              key={f.id}
              className="border-b hairline"
              initial={{ opacity: 0, x: reduced ? 0 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, delay: 0.1 * i, ease: ease.veil }}
            >
              <Link
                href={`/soins?categorie=${f.id}`}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 transition-[padding] duration-[var(--dur-3)] ease-[var(--ease-veil)] hover:pl-3 sm:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.4fr)_auto] sm:py-7"
              >
                <span className="font-serif text-[1.1rem] text-argile-deep sm:text-[1.35rem]">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[clamp(1.5rem,1rem+1.8vw,2.75rem)] font-light leading-none tracking-[-0.035em]">{f.label}</span>
                <span className="col-span-2 col-start-2 row-start-2 max-w-[52ch] text-[0.95rem] text-prune-soft sm:col-span-1 sm:col-start-3 sm:row-start-1">
                  {f.intro}
                </span>
                <span className="col-start-3 row-start-1 flex items-center gap-3 whitespace-nowrap text-[0.9rem] sm:col-start-4">
                  <span className="hidden text-prune-mute md:inline">
                    {f.nombre} soin{f.nombre > 1 ? "s" : ""} · dès
                  </span>
                  <span className="font-serif text-[1.15rem]">{formatPrix(f.depuis)}</span>
                  <span className="grid size-9 place-items-center rounded-full border border-prune/25 transition-[background-color,color,transform] duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:rotate-[-35deg] group-hover:bg-prune group-hover:text-lait">
                    <Icon name="fleche" size={16} />
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ol>
      </div>
    </motion.section>
    </div>
  );
}
