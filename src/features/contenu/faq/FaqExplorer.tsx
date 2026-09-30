"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Fragment, useId, useMemo, useState, type ReactNode } from "react";
import { site } from "@/config/site";
import type { QR } from "@/data/faq";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { matches, normalize } from "@/features/contenu/normalize";

export const THEMES: { id: QR["theme"]; label: string; intro: string }[] = [
  { id: "reservation", label: "Réserver & annuler", intro: "En ligne, par téléphone, et si vous avez un empêchement." },
  { id: "soins", label: "Les soins", intro: "Premier soin, grossesse, cure thermale, produits." },
  { id: "cadeaux", label: "Bons cadeaux", intro: "Validité, échange, montant." },
  { id: "pratique", label: "Venir à l'institut", intro: "Stationnement, trajet, temps à prévoir." },
];

const variants: Record<string, string> = { a: "aàâä", e: "eéèêë", i: "iîï", o: "oôö", u: "uùûü", c: "cç", y: "yÿ" };

/** Surligne les mots recherchés, sans tenir compte des accents. */
function highlight(text: string, query: string): ReactNode {
  const words = normalize(query)
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (!words.length) return text;
  const pattern = words
    .map((w) =>
      Array.from(w)
        .map((ch) => (variants[ch] ? `[${variants[ch]}]` : ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
        .join(""),
    )
    .join("|");
  const re = new RegExp(`(${pattern})`, "gi");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-[4px] bg-argile-pale px-0.5 text-prune">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function FaqExplorer({ items }: { items: QR[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const searchId = useId();
  const searching = normalize(query).length >= 2;

  const groups = useMemo(
    () =>
      THEMES.map((t) => ({
        ...t,
        items: items.map((qr, index) => ({ ...qr, index })).filter((qr) => qr.theme === t.id && (!searching || matches(`${qr.q} ${qr.r}`, query))),
      })).filter((g) => g.items.length),
    [items, query, searching],
  );
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="grid gap-1.5 lg:col-span-6">
          <label htmlFor={searchId} className="font-display text-[0.9rem]">
            Chercher une réponse
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="annuler, grossesse, parking, bon cadeau…"
            autoComplete="off"
            className="block min-h-14 w-full rounded-full border border-prune/20 bg-ecume px-6 text-[1.05rem] text-prune placeholder:text-prune-mute/80 transition-[border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune/40 focus:border-prune focus:outline-none focus:ring-4 focus:ring-argile/25"
          />
        </div>
        <nav aria-label="Thèmes" className="lg:col-span-6">
          <ul className="flex flex-wrap gap-2">
            {THEMES.map((t) => {
              const n = groups.find((g) => g.id === t.id)?.items.length ?? 0;
              return (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    aria-disabled={n === 0 || undefined}
                    tabIndex={n === 0 ? -1 : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-full border border-prune/25 px-4 font-display text-[0.875rem] transition-[background-color,border-color,color,opacity] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune hover:bg-prune hover:text-lait",
                      n === 0 && "pointer-events-none opacity-40",
                    )}
                  >
                    {t.label}
                    <span className="tabular font-serif text-[0.8rem] opacity-70">{n}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <p role="status" aria-live="polite" className="mt-4 text-[0.8125rem] text-prune-mute">
        {searching ? `${total} réponse${total > 1 ? "s" : ""} pour « ${query.trim()} »` : `${items.length} questions, ${THEMES.length} thèmes`}
      </p>

      {total === 0 ? (
        <div className="mt-10 rounded-[var(--radius-card)] bg-voile p-8">
          <p className="font-display text-[1.4rem] font-light">Pas encore de réponse écrite à cette question.</p>
          <p className="mt-2 text-prune-soft">
            Posez-la nous directement :{" "}
            <a href={site.contact.phoneHref} className="underline underline-offset-4">
              {site.contact.phone}
            </a>{" "}
            ou{" "}
            <Link href="/infos-pratiques#contact" className="underline underline-offset-4">
              par écrit
            </Link>
            , réponse {site.contact.responseTime}.
          </p>
        </div>
      ) : null}

      <div className="mt-12 space-y-16 lg:space-y-24">
        {groups.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`t-${g.id}`} className="grid scroll-mt-28 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <span aria-hidden className="tabular font-serif text-[clamp(3rem,2rem+3vw,5.5rem)] leading-none text-argile-deep/80">
                  {String(g.items.length).padStart(2, "0")}
                </span>
                <h2 id={`t-${g.id}`} className="mt-2 font-display text-title font-light">
                  {g.label}
                </h2>
                <p className="mt-2 max-w-[30ch] text-prune-soft">{g.intro}</p>
              </div>
            </div>
            <ul className="border-t hairline lg:col-span-8">
              {g.items.map((qr, i) => (
                <Item
                  key={qr.index}
                  qr={qr}
                  order={i}
                  open={searching || open.has(qr.index)}
                  onToggle={() => toggle(qr.index)}
                  query={searching ? query : ""}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Item({ qr, open, onToggle, query, order }: { qr: QR; open: boolean; onToggle: () => void; query: string; order: number }) {
  const reduced = useReducedMotion();
  const id = useId();
  return (
    <motion.li
      className="border-b hairline"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, delay: order * 0.05, ease: ease.veil }}
    >
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-r`}
          onClick={onToggle}
          className="group flex min-h-16 w-full items-start justify-between gap-6 py-5 text-left"
        >
          <span className="font-display text-[clamp(1.1rem,1rem+0.4vw,1.35rem)] leading-snug transition-colors duration-[var(--dur-2)] group-hover:text-argile-deep ease-[var(--ease-veil)]">
            {highlight(qr.q, query)}
          </span>
          <span
            aria-hidden
            className={cn(
              "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border transition-[transform,background-color,color,border-color] duration-[var(--dur-3)] ease-[var(--ease-veil)]",
              open ? "rotate-45 border-prune bg-prune text-lait" : "border-prune/25 group-hover:border-prune",
            )}
          >
            <Icon name="plus" size={16} />
          </span>
        </button>
      </h3>
      <motion.div
        id={`${id}-r`}
        role="region"
        aria-labelledby={`${id}-q`}
        inert={!open}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.55, ease: ease.veil }}
        className="overflow-hidden"
      >
        <p className="max-w-[62ch] pb-6 pr-12 text-prune-soft">{highlight(qr.r, query)}</p>
      </motion.div>
    </motion.li>
  );
}
