"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

/** Événement émis par les liens « Offrir » de la page (présélection d'un soin). */
export const OFFRIR_EVENT = "brume:offrir";

/** Liste dont chaque ligne trace d'abord son filet, puis fait monter son texte. */
export function DrawnList({ items }: { items: { icon: IconName; title: string; text: ReactNode }[] }) {
  const reduced = useReducedMotion();
  return (
    <ul className="border-b hairline">
      {items.map((it, i) => (
        <motion.li
          key={it.title}
          className="relative grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6 sm:py-9"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delayChildren: i * 0.08 }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--color-ligne)]"
            variants={{ hidden: { scaleX: reduced ? 1 : 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease: ease.tide } } }}
          />
          <motion.span
            aria-hidden
            className="grid size-11 place-items-center rounded-full bg-sable text-prune"
            variants={{ hidden: { opacity: 0, scale: reduced ? 1 : 0.6 }, show: { opacity: 1, scale: 1, transition: { duration: 0.7, delay: 0.25, ease: ease.veil } } }}
          >
            <Icon name={it.icon} size={20} />
          </motion.span>
          <motion.div
            variants={{ hidden: { opacity: 0, y: reduced ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.3, ease: ease.veil } } }}
          >
            <h3 className="font-display text-[1.25rem] tracking-[-0.02em]">{it.title}</h3>
            <p className="mt-2 max-w-[54ch] text-prune-soft">{it.text}</p>
          </motion.div>
        </motion.li>
      ))}
    </ul>
  );
}

/** Mini-FAQ en accordéon : chaque question sort d'un léger flou. */
export function FaqList({ items }: { items: { q: string; r: ReactNode }[] }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="border-t hairline">
      {items.map((it, i) => {
        const on = open === i;
        const id = `faq-cadeau-${i}`;
        return (
          <motion.li
            key={it.q}
            className="border-b hairline"
            initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)", y: 10 }}
            whileInView={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, delay: i * 0.07, ease: ease.float }}
          >
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={id}
                onClick={() => setOpen(on ? null : i)}
                className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-display text-[1.1rem] tracking-[-0.015em] transition-colors hover:text-argile-deep sm:text-[1.2rem]"
              >
                {it.q}
                <span
                  aria-hidden
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border border-prune/20 transition-[transform,background-color,color] duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:border-prune",
                    on && "rotate-45 bg-prune text-lait",
                  )}
                >
                  <Icon name="plus" size={16} />
                </span>
              </button>
            </h3>
            <motion.div
              id={id}
              role="region"
              aria-hidden={!on}
              initial={false}
              animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
              transition={{ duration: reduced ? 0.15 : 0.5, ease: ease.veil }}
              className="overflow-hidden"
              inert={!on}
            >
              <p className="max-w-[62ch] pb-6 pr-12 text-prune-soft">{it.r}</p>
            </motion.div>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** Rangée de budget : l'étiquette de prix glisse sous masque, les soins suivent. */
export function BudgetRow({ label, note, children, index }: { label: string; note: string; children: ReactNode; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="grid gap-5 border-t hairline py-8 lg:grid-cols-12 lg:gap-10 lg:py-10"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      <div className="lg:col-span-4">
        <span className="block overflow-hidden pb-1">
          <motion.span
            className="block font-serif text-[clamp(2rem,1.4rem+2.2vw,3.25rem)] leading-none"
            variants={{
              hidden: reduced ? { opacity: 0 } : { y: "105%" },
              show: reduced ? { opacity: 1 } : { y: "0%", transition: { duration: 1, ease: ease.veil, delay: index * 0.05 } },
            }}
          >
            {label}
          </motion.span>
        </span>
        <motion.p
          className="mt-3 max-w-[30ch] text-[0.95rem] text-prune-soft"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay: 0.3 } } }}
        >
          {note}
        </motion.p>
      </div>
      <motion.ul
        className="grid gap-1 lg:col-span-7 lg:col-start-6"
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: 0.2 } } }}
      >
        {children}
      </motion.ul>
    </motion.div>
  );
}

export function BudgetItem({ slug, nom, detail, prix }: { slug: string; nom: string; detail: string; prix: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      className="group flex items-center justify-between gap-4 rounded-[var(--radius-soft)] px-3 py-2 transition-colors duration-[var(--dur-2)] hover:bg-sable/50 sm:px-4"
      variants={{ hidden: { opacity: 0, x: reduced ? 0 : -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: ease.veil } } }}
    >
      <div className="min-w-0">
        <Link href={`/soins/${slug}`} className="font-display text-[1.05rem] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-prune/50">
          {nom}
        </Link>
        <p className="text-caption text-prune-mute">
          {detail} · <span className="font-serif text-[0.95rem] text-prune tabular">{prix}</span>
        </p>
      </div>
      <Link
        href={`/bons-cadeaux?soin=${slug}#composer`}
        onClick={(e) => {
          // Même page : pas de navigation (qui remonterait le formulaire), on présélectionne et on remonte.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          window.history.replaceState(null, "", `/bons-cadeaux?soin=${slug}`);
          window.dispatchEvent(new CustomEvent(OFFRIR_EVENT, { detail: slug }));
          document.getElementById("composer")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }}
        aria-label={`Offrir le soin ${nom}`}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-prune/25 px-4 font-display text-[0.875rem] transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune hover:bg-prune hover:text-lait"
      >
        Offrir
        <Icon name="cadeau" size={16} />
      </Link>
    </motion.li>
  );
}
