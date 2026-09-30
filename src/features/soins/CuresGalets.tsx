"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useId, useRef, useState } from "react";
import { cures, detailsCure, type Cure } from "@/data/rituels";
import { formatPrix, getCategorie } from "@/data/soins";
import { MontantAnime } from "./effets";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

type Detail = Omit<Cure, "soin"> & ReturnType<typeof detailsCure>;

/** Cures regroupées par soin, la plus longue d'abord. */
function parSoin(): Detail[][] {
  const map = new Map<string, Detail[]>();
  for (const c of cures) {
    const list = map.get(c.soin) ?? [];
    list.push({ ...c, ...detailsCure(c) });
    map.set(c.soin, list);
  }
  return [...map.values()].map((l) => l.sort((a, b) => b.seances - a.seances));
}

/**
 * Les cures, avec un ancrage prix lisible : prix unitaire × séances barré,
 * prix de la cure, économie en compteur, prix par séance. Une rangée de
 * galets se remplit d'eau, séance après séance, au fil du scroll.
 */
export function CuresGalets() {
  const groupes = parSoin();
  return (
    <ol className="divide-y divide-[var(--color-ligne)]">
      {groupes.map((g, i) => (
        <li key={g[0].soin.slug} className="py-12 first:pt-0 last:pb-0 lg:py-20">
          <BlocCure options={g} rang={i} />
        </li>
      ))}
    </ol>
  );
}

function BlocCure({ options, rang }: { options: Detail[]; rang: number }) {
  const [id, setId] = useState(options[0].id);
  const c = options.find((o) => o.id === id) ?? options[0];
  const cat = getCategorie(c.soin.categorie);
  const reduced = useReducedMotion();
  const rangee = useRef<HTMLDivElement>(null);
  const nom = useId();
  const { scrollYProgress } = useScroll({ target: rangee, offset: ["start 88%", "end 45%"] });

  return (
    <article className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
      <header className={cn("lg:col-span-4", rang % 2 === 1 ? "lg:col-start-9 lg:row-start-1" : "lg:col-start-1")}>
        <p className="eyebrow text-argile-deep">
          Cure · {cat.court}
        </p>
        <h3 className="mt-4 font-display text-[clamp(1.9rem,1.2rem+2.4vw,3.4rem)] font-light leading-[1] tracking-[-0.04em]">
          <Link href={`/soins/${c.soin.slug}`} className="underline decoration-prune/0 decoration-1 underline-offset-[0.18em] transition-[text-decoration-color] duration-[var(--dur-3)] hover:decoration-prune/40">
            {c.soin.nom}
          </Link>
        </h3>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: ease.veil }}
          >
            <p className="mt-5 max-w-[42ch] text-prune-soft">{c.pourquoi}</p>
            <p className="mt-4 flex items-start gap-2 text-caption text-prune-mute">
              <Icon name="calendrier" size={16} className="mt-0.5 shrink-0" />
              {c.rythme}
            </p>
          </motion.div>
        </AnimatePresence>
      </header>

      <div className={cn("min-w-0 lg:col-span-7", rang % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-6")}>
        {options.length > 1 ? (
          <div role="group" aria-labelledby={nom} className="mb-6 flex flex-wrap items-center gap-3">
            <span id={nom} className="text-caption text-prune-mute">
              Formule
            </span>
            <div className="inline-flex rounded-full border border-prune/20 p-1">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={o.id === c.id}
                  onClick={() => setId(o.id)}
                  className={cn(
                    "relative min-h-11 rounded-full px-4 font-display text-[0.875rem] transition-[color,scale] duration-[var(--dur-2)] ease-[var(--ease-veil)] active:scale-[0.97]",
                    o.id === c.id ? "text-lait" : "text-prune hover:text-prune-soft",
                  )}
                >
                  {o.id === c.id ? (
                    <motion.span
                      layoutId={reduced ? undefined : `formule-${c.soin.slug}`}
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-prune"
                      transition={{ duration: 0.5, ease: ease.veil }}
                    />
                  ) : null}
                  <span className="relative">{o.seances} séances</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Galets qui se remplissent */}
        <div ref={rangee} className="flex items-end gap-2 sm:gap-3" aria-hidden>
          {Array.from({ length: c.seances }, (_, i) => (
            <Galet key={`${c.id}-${i}`} i={i} n={c.seances} progress={scrollYProgress} reduced={reduced} />
          ))}
          {c.seances < 5
            ? Array.from({ length: 5 - c.seances }, (_, i) => <span key={`vide-${i}`} className="galet aspect-[5/4] flex-1 border border-dashed border-prune/15" />)
            : null}
        </div>

        {/* Ancrage prix */}
        <dl className="mt-8 grid gap-x-6 gap-y-6 border-t hairline pt-6 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div>
            <dt className="text-caption text-prune-mute">
              À l&rsquo;unité · {formatPrix(c.soin.prix)} × {c.seances}
            </dt>
            <dd className="tabular mt-1 font-serif text-[1.6rem] leading-none text-prune-mute">
              <s className="decoration-argile-deep/70 decoration-2">{formatPrix(c.unitaire)}</s>
              <span className="sr-only"> (prix sans la cure)</span>
            </dd>
          </div>
          <div>
            <dt className="text-caption text-prune-mute">La cure</dt>
            <dd className="tabular mt-1 font-serif text-[clamp(2.6rem,1.8rem+2.6vw,4.2rem)] leading-[0.9]">{formatPrix(c.prix)}</dd>
          </div>
          <div className="rounded-[var(--radius-soft)] bg-sauge-pale px-5 py-4 sm:ml-2">
            <dt className="text-caption text-sauge-deep">Économie</dt>
            <dd className="mt-1 flex items-end gap-4">
              <span className="font-serif text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-[0.9] text-sauge-deep">
                <MontantAnime valeur={c.economie} />
              </span>
              <span className="pb-0.5 text-caption text-prune-soft">
                soit <span className="tabular font-serif text-[1.05rem] text-prune">{formatPrix(c.parSeance)}</span>
                <br />
                la séance
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={`/reserver?soin=${c.soin.slug}`} icon="fleche">
            Réserver la 1<sup>re</sup> séance
          </Button>
          <Button href={`/bons-cadeaux?soin=${c.soin.slug}`} variant="ghost" iconLeft="cadeau">
            Offrir la cure
          </Button>
        </div>
      </div>
    </article>
  );
}

function Galet({ i, n, progress, reduced }: { i: number; n: number; progress: MotionValue<number>; reduced: boolean }) {
  const fill = useTransform(progress, [i / n, (i + 1) / n], reduced ? [1, 1] : [0, 1]);
  const y = useTransform(fill, (v) => `${(1 - v) * 100}%`);
  const label = useTransform(fill, [0.5, 1], [0.35, 1]);
  return (
    <motion.span
      className="galet relative block aspect-[5/4] min-w-0 flex-1 overflow-hidden bg-sable shadow-[var(--shadow-galet)]"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: i * 0.05, ease: ease.veil }}
    >
      {/* L'eau monte : un bloc qui remonte depuis le bas, sa crête marquée d'un filet d'écume */}
      <motion.span className="absolute inset-0 border-t border-ecume/90 bg-linear-to-t from-sauge to-sauge-pale" style={{ y }} />
      <motion.span style={{ opacity: label }} className="tabular absolute inset-0 grid place-items-center font-serif text-[clamp(1rem,0.8rem+1vw,1.6rem)] text-prune">
        {i + 1}
      </motion.span>
    </motion.span>
  );
}
