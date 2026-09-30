"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { site } from "@/config/site";
import { fromIso, isoDate, type Creneau } from "@/data/planning";
import { getPraticienne } from "@/data/praticiennes";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import type { ChoixPraticienne, Prestation } from "./schema";
import { calendrier, heureFr, jourLong, type JourDispo } from "./slots";

const JOURS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

export function StepCreneau({
  presta,
  choix,
  now,
  date,
  heure,
  onPickDate,
  onPickSlot,
}: {
  presta: Prestation;
  choix: ChoixPraticienne;
  now: Date | null;
  date?: string;
  heure?: string;
  onPickDate: (iso: string) => void;
  onPickSlot: (iso: string, c: Creneau) => void;
}) {
  const reduced = useReducedMotion();
  const cal = useMemo(() => (now ? calendrier(presta.duree, choix, now) : []), [now, presta.duree, choix]);
  const byIso = useMemo(() => new Map(cal.map((j) => [j.iso, j])), [cal]);
  const premier = cal.find((j) => j.creneaux.length);
  const actif = (date && byIso.get(date)) || premier;

  const weeks = useMemo(() => buildWeeks(cal, now), [cal, now]);

  if (!now) {
    return (
      <div className="grid gap-3" aria-busy="true">
        <p className="text-prune-soft">Calcul des disponibilités…</p>
        <div className="h-72 animate-pulse rounded-[var(--radius-card)] bg-voile" />
      </div>
    );
  }

  const mois = Array.from(new Set(cal.map((j) => j.date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }))));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:gap-10">
      {/* Calendrier */}
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display text-[1.1rem] capitalize">{mois.join(" — ")}</p>
          <p className="text-[0.8125rem] text-prune-mute">3 semaines</p>
        </div>
        {/* Mobile : bande de jours à faire défiler (cibles de 64 px) */}
        <ul className="-mx-1 mt-4 flex snap-x gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none] sm:hidden" aria-label="Jours disponibles">
          {cal.map((j) => {
            const n = j.creneaux.length;
            const on = actif?.iso === j.iso;
            const complet = n === 0;
            return (
              <li key={j.iso} className="snap-start">
                <button
                  type="button"
                  disabled={complet}
                  aria-pressed={on}
                  aria-label={`${jourLong(j.date)} — ${complet ? "complet" : `${n} créneau${n > 1 ? "x" : ""}`}`}
                  onClick={() => onPickDate(j.iso)}
                  className={cn(
                    "relative flex w-16 flex-col items-center overflow-hidden rounded-[22px] border px-1 py-2.5 transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)]",
                    complet && "border-transparent bg-voile text-prune/40",
                    !complet && !on && "border-prune/15 bg-ecume",
                    on && "border-prune bg-prune text-lait",
                  )}
                >
                  {!complet ? (
                    <span aria-hidden className={cn("absolute inset-x-0 bottom-0", on ? "bg-lait/15" : "bg-sauge-pale")} style={{ height: `${Math.min(100, 12 + n * 4)}%` }} />
                  ) : null}
                  <span className="relative text-[0.7rem] uppercase tracking-wider opacity-75">{j.date.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                  <span className="tabular relative font-display text-[1.35rem] leading-tight">{j.date.getDate()}</span>
                  <span className="relative text-[0.7rem] opacity-75">{complet ? "complet" : j.date.toLocaleDateString("fr-FR", { month: "short" })}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 hidden grid-cols-7 gap-1 text-center text-[0.75rem] text-prune-mute sm:grid" aria-hidden>
          {JOURS.map((j) => (
            <span key={j}>{j}</span>
          ))}
        </div>
        <ul className="mt-2 hidden grid-cols-7 gap-1 sm:grid" aria-label="Jours disponibles">
          {weeks.flat().map((cell) => {
            if (cell.kind === "vide") return <li key={cell.key} aria-hidden />;
            if (cell.kind === "ferme") {
              return (
                <li key={cell.key} aria-hidden className="grid aspect-square place-items-center rounded-full text-[0.85rem] text-prune/25">
                  {cell.date.getDate()}
                </li>
              );
            }
            const j = cell.jour;
            const n = j.creneaux.length;
            const on = actif?.iso === j.iso;
            const complet = n === 0;
            return (
              <li key={cell.key}>
                <button
                  type="button"
                  disabled={complet}
                  aria-pressed={on}
                  aria-label={`${jourLong(j.date)} — ${complet ? "complet" : `${n} créneau${n > 1 ? "x" : ""}`}`}
                  onClick={() => onPickDate(j.iso)}
                  className={cn(
                    "relative grid aspect-square w-full min-h-11 place-items-center overflow-hidden rounded-full border text-[0.95rem] transition-[background-color,border-color,color,transform] duration-[var(--dur-2)] ease-[var(--ease-veil)]",
                    complet && "cursor-not-allowed border-transparent text-prune/35 line-through decoration-prune/30",
                    !complet && !on && "border-prune/15 bg-ecume hover:-translate-y-0.5 hover:border-prune",
                    on && "border-prune bg-prune text-lait",
                  )}
                >
                  {/* niveau d'eau = disponibilité */}
                  {!complet ? (
                    <span
                      aria-hidden
                      className={cn("absolute inset-x-0 bottom-0 transition-[height] duration-[var(--dur-4)] ease-[var(--ease-veil)]", on ? "bg-lait/15" : "bg-sauge-pale")}
                      style={{ height: `${Math.min(100, 18 + n * 5)}%` }}
                    />
                  ) : null}
                  <span className="relative leading-none">
                    {cell.date.getDate() === 1 || cell.premier ? (
                      <span className="block text-[0.6rem] uppercase tracking-wider opacity-70">{cell.date.toLocaleDateString("fr-FR", { month: "short" })}</span>
                    ) : null}
                    <span className="tabular">{cell.date.getDate()}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 hidden flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-prune-mute sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-3 rounded-full bg-sauge-pale ring-1 ring-prune/15" /> plus il y a d&apos;eau, plus il y a de place
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="line-through">12</span> complet
          </span>
        </p>
      </div>

      {/* Créneaux du jour */}
      <div className="min-h-64">
        <AnimatePresence mode="wait" initial={false}>
          {actif ? (
            <motion.div
              key={actif.iso}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 18, filter: "blur(4px)" }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: ease.veil }}
            >
              <h3 className="font-display text-[1.35rem] font-light first-letter:uppercase">{jourLong(actif.date)}</h3>
              <p className="mt-1 text-[0.9rem] text-sauge-deep" aria-live="polite">
                {actif.creneaux.length} créneau{actif.creneaux.length > 1 ? "x" : ""} ce jour
                {isoDate(now) === actif.iso ? " — réservation possible jusqu'à 2 h avant" : ""}
              </p>
              <Slots jour={actif} choix={choix} heure={date === actif.iso ? heure : undefined} onPick={(c) => onPickSlot(actif.iso, c)} reduced={reduced} />
            </motion.div>
          ) : (
            <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: ease.veil }} className="rounded-[var(--radius-card)] bg-voile p-6 text-prune-soft">
              Plus aucun créneau en ligne sur les trois prochaines semaines pour ce soin. Appelez-nous au{" "}
              <a href={site.contact.phoneHref} className="underline underline-offset-4">
                {site.contact.phone}
              </a>{" "}
              : il y a souvent des désistements.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Slots({
  jour,
  choix,
  heure,
  onPick,
  reduced,
}: {
  jour: JourDispo;
  choix: ChoixPraticienne;
  heure?: string;
  onPick: (c: Creneau) => void;
  reduced: boolean;
}) {
  const groupes = [
    { label: "Matin", items: jour.creneaux.filter((c) => c.heure < "13:00") },
    { label: "Après-midi", items: jour.creneaux.filter((c) => c.heure >= "13:00" && c.heure < "17:00") },
    { label: "Fin de journée", items: jour.creneaux.filter((c) => c.heure >= "17:00") },
  ]
    .filter((g) => g.items.length)
    .map((g, gi, all) => ({ ...g, offset: all.slice(0, gi).reduce((n, x) => n + x.items.length, 0) }));

  return (
    <div className="mt-6 space-y-6">
      {groupes.map((g) => (
        <div key={g.label} role="group" aria-label={g.label}>
          <p className="eyebrow text-prune-mute">{g.label}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {g.items.map((c, ci) => {
              const on = heure === c.heure;
              const p = choix === "indifferent" ? getPraticienne(c.praticienne) : undefined;
              const i = g.offset + ci;
              return (
                <motion.li
                  key={c.heure}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.025, 0.4), ease: ease.veil }}
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onPick(c)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 transition-[background-color,border-color,color,transform] duration-[var(--dur-2)] ease-[var(--ease-veil)] active:scale-95",
                      on ? "border-prune bg-prune text-lait" : "border-prune/20 bg-ecume hover:border-prune hover:bg-sable/60",
                    )}
                  >
                    <span className="tabular font-display">{heureFr(c.heure)}</span>
                    {p ? (
                      <span className={cn("text-[0.75rem]", on ? "text-lait/75" : "text-prune-mute")}>
                        <span aria-hidden>{p.prenom[0]}.</span>
                        <span className="sr-only">avec {p.prenom}</span>
                      </span>
                    ) : null}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}
      {choix === "indifferent" ? <p className="text-[0.8125rem] text-prune-mute">C. = Clémence, I. = Inès — la praticienne libre à cette heure.</p> : null}
    </div>
  );
}

type Cell =
  | { kind: "vide"; key: string }
  | { kind: "ferme"; key: string; date: Date }
  | { kind: "ouvert"; key: string; date: Date; jour: JourDispo; premier: boolean };

/** Semaines du lundi au dimanche couvrant l'horizon de réservation. */
function buildWeeks(cal: JourDispo[], now: Date | null): Cell[][] {
  if (!cal.length || !now) return [];
  const byIso = new Map(cal.map((j) => [j.iso, j]));
  const first = cal[0].date;
  const last = cal[cal.length - 1].date;
  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(last);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weeks: Cell[][] = [];
  let week: Cell[] = [];
  let firstOpen = true;
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = isoDate(d);
    const j = byIso.get(iso);
    const date = fromIso(iso);
    if (d < today) week.push({ kind: "vide", key: iso });
    else if (j) {
      week.push({ kind: "ouvert", key: iso, date, jour: j, premier: firstOpen });
      firstOpen = false;
    } else week.push({ kind: "ferme", key: iso, date });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);
  return weeks;
}
