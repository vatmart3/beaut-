"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { avis, chiffres } from "@/data/avis";
import { Counter } from "@/components/effects/Reveal";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

const mois = (d: string) => new Date(`${d}-01T12:00:00`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

/**
 * Avis — présentés comme un carnet : un index de prénoms à gauche, la
 * phrase qui compte en grand à droite. Pas d'étoiles, pas de carrousel.
 */
export function Avis() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const a = avis[i];

  return (
    <section aria-labelledby="avis-title" className="shell relative overflow-hidden bg-sauge-pale px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-sauge-deep">Le carnet</p>
          <h2 id="avis-title" className="mt-5 font-display text-[clamp(2.25rem,1.2rem+3.4vw,4.75rem)] font-light leading-[0.98] tracking-[-0.045em]">
            Ce qu&apos;on nous écrit.
          </h2>
        </div>
        <dl className="grid grid-cols-2 gap-8 sm:gap-14">
          <div className="flex flex-col-reverse gap-2">
            <dt className="text-[0.85rem] text-prune-soft">clientes reçues chaque mois</dt>
            <dd className="font-serif text-[2.6rem] leading-none">
              <Counter to={chiffres.clientesParMois} />
            </dd>
          </div>
          <div className="flex flex-col-reverse gap-2">
            <dt className="text-[0.85rem] text-prune-soft">reviennent dans les 3 mois</dt>
            <dd className="font-serif text-[2.6rem] leading-none">
              <Counter to={chiffres.tauxRetour} suffix=" %" />
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12">
        <ul className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2 [scrollbar-width:none] lg:col-span-4 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0" aria-label="Choisir un avis">
          {avis.map((x, k) => (
            <li key={x.prenom} className="shrink-0">
              <button
                type="button"
                onClick={() => setI(k)}
                aria-pressed={k === i}
                className={cn(
                  "group flex min-h-11 w-full items-baseline gap-3 rounded-full px-4 py-2 text-left transition-[background-color,color,padding] duration-[var(--dur-3)] ease-[var(--ease-veil)] lg:rounded-[14px] lg:py-3",
                  k === i ? "bg-prune text-lait lg:pl-6" : "hover:bg-ecume/70",
                )}
              >
                <span className="whitespace-nowrap font-display text-[1rem] tracking-[-0.01em]">{x.prenom}</span>
                <span className={cn("hidden truncate text-[0.85rem] lg:inline", k === i ? "text-lait/70" : "text-prune-mute")}>
                  {x.ville} · {x.soin}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="relative min-h-[340px] lg:col-span-8" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={i}
              initial={{ opacity: 0, filter: reduced ? "none" : "blur(12px)", y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: reduced ? "none" : "blur(12px)" }}
              transition={{ duration: 0.6, ease: ease.veil }}
            >
              <blockquote>
                <p className="font-display text-[clamp(1.75rem,1rem+2.6vw,3.5rem)] font-light leading-[1.08] tracking-[-0.035em]">«&nbsp;{a.extrait}&nbsp;»</p>
                <p className="mt-8 max-w-[60ch] text-lead text-prune-soft">{a.texte}</p>
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9rem]">
                <span className="font-display">{a.prenom}</span>
                <span aria-hidden className="size-1 rounded-full bg-prune/40" />
                <span className="text-prune-soft">{a.ville}</span>
                <span aria-hidden className="size-1 rounded-full bg-prune/40" />
                <span className="rounded-full border border-prune/20 px-3 py-1 font-display text-[0.8rem]">{a.soin}</span>
                <span className="text-prune-mute">{mois(a.date)}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
      <p className="mt-12 text-[0.8rem] text-prune-mute">Avis recueillis à l&apos;institut, publiés avec l&apos;accord des clientes.</p>
    </section>
  );
}
