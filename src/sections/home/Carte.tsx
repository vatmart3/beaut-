"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { categories, soins, formatDuree, formatPrix, prixDepart, type CategorieId } from "@/data/soins";
import { RippleCanvas } from "@/components/effects/RippleCanvas";
import { Matiere } from "@/components/ui/Matiere";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { LineReveal } from "@/components/effects/LineReveal";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

/** Aperçu de la carte : une famille à la fois, petite reprise d'onde à chaque changement. */
export function Carte() {
  const [cat, setCat] = useState<CategorieId>("visage");
  const [hover, setHover] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
  const [origin, setOrigin] = useState({ x: 0.2, y: 0.2 });
  const box = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const list = soins.filter((s) => s.categorie === cat);
  const active = list.find((s) => s.slug === hover) ?? list[0];

  const select = (id: CategorieId, el: HTMLElement) => {
    if (id === cat) return;
    const b = box.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (b) setOrigin({ x: (r.left + r.width / 2 - b.left) / b.width, y: (r.top + r.height / 2 - b.top) / b.height });
    setCat(id);
    setHover(null);
    setTrigger((t) => t + 1);
  };

  return (
    <section aria-labelledby="carte-title" className="shell relative overflow-hidden px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div ref={box} className="relative">
        <RippleCanvas trigger={trigger} origin={origin} duration={1.8} strength={0.55} shadow="#9CAF9A" className="z-0" />

        <div className="relative z-[1] flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-argile-deep">La carte</p>
            <LineReveal as="h2" id="carte-title" text="Des soins décrits à la minute près." className="mt-5 max-w-[14ch] font-display text-[clamp(2.25rem,1.2rem+3.4vw,4.75rem)] font-light leading-[0.98] tracking-[-0.045em]" />
          </div>
          <div role="tablist" aria-label="Familles de soins" className="-mx-1 flex flex-wrap gap-2 px-1">
            {categories.map((c) => (
              <button
                key={c.id}
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={cat === c.id}
                aria-controls="carte-panel"
                onClick={(e) => select(c.id, e.currentTarget)}
                className={cn(
                  "min-h-11 rounded-full border px-5 font-display text-[0.9rem] transition-[background-color,color,border-color] duration-[var(--dur-2)] ease-[var(--ease-veil)]",
                  cat === c.id ? "border-prune bg-prune text-lait" : "border-prune/25 hover:border-prune",
                )}
              >
                {c.court}
              </button>
            ))}
          </div>
        </div>

        <div id="carte-panel" role="tabpanel" aria-labelledby={`tab-${cat}`} className="relative z-[1] mt-14 grid gap-10 lg:grid-cols-12">
          <div className="relative hidden lg:col-span-4 lg:block">
            <div className="sticky top-28">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active.slug}
                  initial={{ opacity: 0, scale: reduced ? 1 : 1.04, filter: reduced ? "none" : "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: reduced ? "none" : "blur(10px)" }}
                  transition={{ duration: 0.8, ease: ease.veil }}
                >
                  <Matiere kind={active.matiere} className="aspect-[4/5] w-full rounded-[var(--radius-card)]" label={`Visuel du soin ${active.nom}`} />
                </motion.div>
              </AnimatePresence>
              <p className="mt-4 text-[0.9rem] text-prune-soft">{categories.find((c) => c.id === cat)?.intro}</p>
            </div>
          </div>

          <ul className="lg:col-span-7 lg:col-start-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((s, i) => (
                <motion.li
                  key={s.slug}
                  layout
                  initial={{ opacity: 0, y: reduced ? 0 : 18, filter: reduced ? "none" : "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: reduced ? "none" : "blur(6px)", transition: { duration: 0.25 } }}
                  transition={{ duration: 0.7, delay: 0.06 * i, ease: ease.veil }}
                  className="border-b hairline first:border-t"
                  onMouseEnter={() => setHover(s.slug)}
                  onFocus={() => setHover(s.slug)}
                >
                  <Link href={`/soins/${s.slug}`} className="group flex items-start gap-4 py-6 sm:gap-6">
                    <Matiere kind={s.matiere} breathe={false} className="size-16 shrink-0 rounded-[40%_60%_55%_45%/50%] sm:size-20 lg:hidden" sizes="80px" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <span className="font-display text-[clamp(1.35rem,1rem+1.2vw,2.1rem)] font-light leading-tight tracking-[-0.03em] transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:translate-x-2">
                          {s.nom}
                        </span>
                        <span className="flex items-baseline gap-3 whitespace-nowrap">
                          <span className="text-[0.875rem] text-prune-mute">{formatDuree(s.duree)}</span>
                          <span className="font-serif text-[1.3rem]">
                            {s.variantes ? <span className="mr-1 font-sans text-[0.8rem] text-prune-mute">dès</span> : null}
                            {formatPrix(prixDepart(s))}
                          </span>
                        </span>
                      </span>
                      <span className="mt-1.5 block max-w-[56ch] text-[0.95rem] text-prune-soft">{s.accroche}</span>
                    </span>
                    <Icon name="fleche" size={18} className="mt-2 hidden shrink-0 opacity-0 transition-[opacity,transform] duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
            <li className="flex flex-wrap items-center gap-3 pt-10">
              <Button href={`/soins?categorie=${cat}`} variant="outline" icon="fleche">
                Toute la carte
              </Button>
              <Link
                href="/conseils/routine-peau-apres-la-mer"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-sauge-pale px-5 font-display text-[0.9rem] transition-colors hover:bg-sauge"
              >
                <Icon name="feuille" size={18} />
                Offert&nbsp;: la routine peau après une journée de mer
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
