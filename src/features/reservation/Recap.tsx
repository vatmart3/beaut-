"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { site } from "@/config/site";
import { fromIso } from "@/data/planning";
import { formatDuree, formatPrix } from "@/data/soins";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { libellePraticienne, type ChoixPraticienne, type Prestation } from "./schema";
import { heureFr, jourLong } from "./slots";

export interface RecapData {
  presta: Prestation | null;
  choix?: ChoixPraticienne;
  attribuee?: string;
  date?: string;
  heure?: string;
}

function rows({ presta, choix, attribuee, date, heure }: RecapData) {
  return [
    { step: 0, label: "Soin", value: presta?.label, edit: true },
    { step: 0, label: "Durée", value: presta ? formatDuree(presta.duree) : undefined },
    { step: 0, label: "Prix", value: presta ? `${formatPrix(presta.prix)}${presta.personnes === 2 ? " pour deux" : ""}` : undefined, serif: true },
    { step: 1, label: "Praticienne", value: choix ? libellePraticienne(choix, heure ? attribuee : undefined) : undefined, edit: true },
    { step: 2, label: "Date", value: date ? jourLong(fromIso(date)) : undefined, edit: true },
    { step: 2, label: "Heure", value: heure ? heureFr(heure) : undefined },
  ];
}

function List({ data, reachable, onEdit, tone }: { data: RecapData; reachable: number; onEdit: (s: number) => void; tone: "prune" | "lait" }) {
  const r = rows(data);
  return (
    <dl className="divide-y divide-current/10">
      {r.map((row) => {
        const editable = "edit" in row && row.value && row.step <= reachable;
        return (
          <div key={row.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-baseline gap-3 py-3">
            <dt className={cn("text-[0.8125rem]", tone === "prune" ? "text-lait/60" : "text-prune-mute")}>{row.label}</dt>
            <dd className={cn("min-w-0 first-letter:uppercase", row.serif ? "tabular font-serif text-[1.25rem] leading-none" : "text-[0.95rem] leading-snug", !row.value && "opacity-50")}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={row.value ?? "vide"}
                  className="block"
                  initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                  transition={{ duration: 0.35, ease: ease.veil }}
                >
                  {row.value ?? "à choisir"}
                </motion.span>
              </AnimatePresence>
            </dd>
            <dd>
              {editable ? (
                <button
                  type="button"
                  onClick={() => onEdit(row.step)}
                  className={cn(
                    "-my-2 min-h-11 rounded-full px-2 text-[0.8125rem] underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current",
                    tone === "prune" ? "text-argile" : "text-argile-deep",
                  )}
                >
                  Modifier<span className="sr-only"> : {row.label.toLowerCase()}</span>
                </button>
              ) : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Récapitulatif collant (desktop). */
export function RecapSidebar({ data, reachable, onEdit }: { data: RecapData; reachable: number; onEdit: (s: number) => void }) {
  return (
    <aside aria-labelledby="recap-titre" className="grain overflow-hidden rounded-[var(--radius-card)] bg-prune p-6 text-lait shadow-[var(--shadow-float)] xl:p-8">
      <div className="relative z-[2]">
        <p id="recap-titre" className="eyebrow text-lait/60">
          Votre demande
        </p>
        <div className="mt-3">
          <List data={data} reachable={reachable} onEdit={onEdit} tone="prune" />
        </div>
        <div className="mt-6 border-t border-lait/15 pt-5 text-[0.875rem] leading-relaxed text-lait/75">
          <p>{site.policies.cancellation}</p>
          <p className="mt-3">
            Plutôt de vive voix ?{" "}
            <a href={site.contact.phoneHref} className="whitespace-nowrap text-lait underline decoration-lait/30 underline-offset-4 hover:decoration-lait">
              {site.contact.phone}
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}

/** Tiroir bas (mobile / tablette). Se place au-dessus de la barre d'actions rapides du site. */
export function RecapDrawer({ data, reachable, onEdit }: { data: RecapData; reachable: number; onEdit: (s: number) => void }) {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();

  // La barre « Actions rapides » (StickyCta) apparaît après 280 px de défilement.
  useEffect(() => {
    const on = () => setLifted(window.scrollY > 280);
    const id = requestAnimationFrame(on);
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", on);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const { presta, date, heure } = data;
  if (!presta) return null;

  return (
    <motion.div
      className="fixed inset-x-3 z-[41] lg:hidden"
      initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1, bottom: lifted ? "calc(max(0.75rem, env(safe-area-inset-bottom)) + 4.25rem)" : "max(0.75rem, env(safe-area-inset-bottom))" }}
      transition={{ duration: 0.5, ease: ease.veil }}
    >
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-prune text-lait shadow-[var(--shadow-float)]">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id={panelId}
              data-lenis-prevent
              initial={reduced ? { opacity: 0 } : { height: 0 }}
              animate={reduced ? { opacity: 1 } : { height: "auto" }}
              exit={reduced ? { opacity: 0 } : { height: 0 }}
              transition={{ duration: 0.5, ease: ease.veil }}
              className="max-h-[60vh] overflow-y-auto"
            >
              <div className="px-5 pt-4">
                <List
                  data={data}
                  reachable={reachable}
                  tone="prune"
                  onEdit={(s) => {
                    setOpen(false);
                    onEdit(s);
                  }}
                />
                <p className="border-t border-lait/15 py-3 text-[0.8125rem] text-lait/70">{site.policies.cancellation}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-14 w-full items-center gap-3 px-5 py-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[0.95rem]">{presta.label}</span>
            <span className="block truncate text-[0.75rem] text-lait/70">
              {formatDuree(presta.duree)}
              {date ? ` · ${fromIso(date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}` : ""}
              {heure ? ` · ${heureFr(heure)}` : ""}
            </span>
          </span>
          <span className="tabular font-serif text-[1.1rem]">{formatPrix(presta.prix)}</span>
          <span aria-hidden className={cn("grid size-8 place-items-center rounded-full bg-lait/10 transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)]", open && "rotate-180")}>
            <Icon name="fleche-bas" size={16} className="rotate-180" />
          </span>
          <span className="sr-only">{open ? "Masquer le récapitulatif" : "Afficher le récapitulatif"}</span>
        </button>
      </div>
    </motion.div>
  );
}
