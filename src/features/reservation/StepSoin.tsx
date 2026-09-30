"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { categories, formatDuree, formatPrix, prixDepart, soins, type CategorieId, type Soin } from "@/data/soins";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { matches } from "@/features/contenu/normalize";

export function StepSoin({
  slug,
  variante,
  onChoose,
}: {
  slug?: string;
  variante: number | null;
  onChoose: (slug: string, variante: number | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategorieId | "tous">("tous");
  const [open, setOpen] = useState<string | null>(() => {
    const s = soins.find((x) => x.slug === slug);
    return s?.variantes ? s.slug : null;
  });
  const searchId = useId();

  const groups = useMemo(() => {
    return categories
      .filter((c) => cat === "tous" || c.id === cat)
      .map((c) => ({
        ...c,
        items: soins.filter(
          (s) =>
            s.categorie === c.id &&
            matches(`${s.nom} ${s.accroche} ${c.label} ${s.variantes?.map((v) => v.label).join(" ") ?? ""}`, query),
        ),
      }))
      .filter((g) => g.items.length);
  }, [cat, query]);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="grid gap-1.5">
          <label htmlFor={searchId} className="font-display text-[0.9rem]">
            Rechercher un soin
          </label>
          <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="modelage, sourcils, duo…"
              autoComplete="off"
              className="block min-h-12 w-full rounded-full border border-prune/20 bg-ecume px-5 text-prune placeholder:text-prune-mute/80 transition-[border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune/40 focus:border-prune focus:outline-none focus:ring-4 focus:ring-argile/25"
          />
        </div>
        <p className="text-[0.8125rem] text-prune-mute sm:pb-3" role="status" aria-live="polite">
          {total} soin{total > 1 ? "s" : ""}
        </p>
      </div>

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]" role="group" aria-label="Filtrer par famille">
        {[{ id: "tous" as const, court: "Tous" }, ...categories].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 font-display text-[0.875rem] transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)]",
              cat === c.id ? "border-prune bg-prune text-lait" : "border-prune/25 hover:border-prune",
            )}
          >
            {c.court}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <p className="mt-10 rounded-[var(--radius-card)] bg-voile p-6 text-prune-soft">
          Aucun soin ne correspond à « {query} ». Essayez « visage », « dos » ou « épilation » — ou appelez-nous, nous trouverons ensemble.
        </p>
      ) : null}

      <div className="mt-6 space-y-10">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`cat-${g.id}`}>
            <div className="flex items-baseline justify-between gap-4 border-b hairline pb-3">
              <h3 id={`cat-${g.id}`} className="font-display text-[1.35rem] font-light">
                {g.label}
              </h3>
              <span className="tabular font-serif text-prune-mute">{String(g.items.length).padStart(2, "0")}</span>
            </div>
            <ul>
              {g.items.map((s) => (
                <SoinRow
                  key={s.slug}
                  soin={s}
                  selected={s.slug === slug}
                  selectedVariante={s.slug === slug ? variante : null}
                  open={open === s.slug}
                  onToggle={() => setOpen((o) => (o === s.slug ? null : s.slug))}
                  onChoose={onChoose}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function SoinRow({
  soin,
  selected,
  selectedVariante,
  open,
  onToggle,
  onChoose,
}: {
  soin: Soin;
  selected: boolean;
  selectedVariante: number | null;
  open: boolean;
  onToggle: () => void;
  onChoose: (slug: string, variante: number | null) => void;
}) {
  const reduced = useReducedMotion();
  const panelId = useId();
  const hasVariantes = !!soin.variantes?.length;
  const duo = (soin.personnes ?? 1) === 2;

  return (
    <li className="border-b hairline">
      <button
        type="button"
        onClick={() => (hasVariantes ? onToggle() : onChoose(soin.slug, null))}
        aria-expanded={hasVariantes ? open : undefined}
        aria-controls={hasVariantes ? panelId : undefined}
        aria-pressed={!hasVariantes ? selected : undefined}
        className={cn(
          "group relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[var(--radius-soft)] px-3 py-4 text-left transition-colors duration-[var(--dur-2)] ease-[var(--ease-veil)] sm:px-4",
          selected && !hasVariantes ? "bg-prune text-lait" : "",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 origin-left scale-x-0 bg-sable/70 transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:scale-x-100",
            selected && !hasVariantes && "hidden",
          )}
        />
        <span className="relative min-w-0">
          <span className="flex flex-wrap items-center gap-x-2 font-display text-[1.08rem] leading-snug">
            {soin.nom}
            {duo ? <span className={cn("rounded-full border px-2 py-0.5 text-[0.7rem]", selected && !hasVariantes ? "border-lait/40" : "border-prune/25")}>pour deux</span> : null}
          </span>
          <span className={cn("mt-0.5 block text-[0.875rem] leading-snug", selected && !hasVariantes ? "text-lait/75" : "text-prune-soft")}>{soin.accroche}</span>
        </span>
        <span className="relative flex items-center gap-3 sm:gap-5">
          <span className="text-right">
            <span className={cn("block text-[0.8125rem]", selected && !hasVariantes ? "text-lait/75" : "text-prune-mute")}>
              {hasVariantes ? `${soin.variantes!.length} options` : formatDuree(soin.duree)}
            </span>
            <span className="tabular block font-serif text-[1.15rem]">
              {hasVariantes ? <span className="font-sans text-[0.75rem]">dès </span> : null}
              {formatPrix(prixDepart(soin))}
            </span>
          </span>
          <span
            aria-hidden
            className={cn(
              "grid size-9 place-items-center rounded-full transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)]",
              selected && !hasVariantes ? "bg-lait/15" : "bg-prune/5 group-hover:translate-x-0.5",
              hasVariantes && open && "rotate-45",
            )}
          >
            <Icon name={hasVariantes ? "plus" : selected ? "check" : "fleche"} size={16} />
          </span>
        </span>
      </button>

      {hasVariantes ? (
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={panelId}
              initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: ease.veil }}
              className="overflow-hidden"
            >
              <ul className="grid gap-2 px-1 pb-5 pt-1 sm:grid-cols-2 sm:px-3" aria-label={`Options — ${soin.nom}`}>
                {soin.variantes!.map((v, i) => {
                  const on = selected && selectedVariante === i;
                  return (
                    <li key={v.label}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => onChoose(soin.slug, i)}
                        className={cn(
                          "flex min-h-12 w-full items-center justify-between gap-3 rounded-full border px-4 py-2 text-left transition-[background-color,border-color,color,transform] duration-[var(--dur-2)] ease-[var(--ease-veil)] active:scale-[0.98]",
                          on ? "border-prune bg-prune text-lait" : "border-prune/20 bg-ecume hover:border-prune",
                        )}
                      >
                        <span className="text-[0.9rem] leading-tight">{v.label}</span>
                        <span className="flex shrink-0 items-baseline gap-2">
                          <span className={cn("text-[0.75rem]", on ? "text-lait/75" : "text-prune-mute")}>{formatDuree(v.duree)}</span>
                          <span className="tabular font-serif">{formatPrix(v.prix)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </li>
  );
}
