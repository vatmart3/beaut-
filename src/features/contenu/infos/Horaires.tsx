"use client";

import { motion } from "motion/react";
import { site, type DayKey } from "@/config/site";
import { fermetures, fromIso, isoDate } from "@/data/planning";
import { h, openStatus } from "@/lib/hours";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { useNow } from "@/features/reservation/useNow";

const keys: DayKey[] = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

/** Pastille « Ouvert jusqu'à 19 h » calculée sur l'heure du navigateur. */
export function OpenStatus({ tone = "light" }: { tone?: "light" | "dark" }) {
  const now = useNow();
  const reduced = useReducedMotion();
  const st = now ? openStatus(now) : null;
  return (
    <p
      className={cn(
        "inline-flex min-h-10 items-center gap-2.5 rounded-full border px-4 text-[0.9rem]",
        tone === "light" ? "border-prune/20 bg-ecume" : "border-lait/25 text-lait",
      )}
      aria-live="polite"
    >
      <span className="relative grid size-2.5 place-items-center" aria-hidden>
        {st?.open && !reduced ? <span className="absolute inset-0 animate-ping rounded-full bg-sauge opacity-60" /> : null}
        <span className={cn("relative size-2.5 rounded-full", st === null ? "bg-prune/20" : st.open ? "bg-sauge-deep" : "bg-argile")} />
      </span>
      {st ? st.label : "Horaires d'ouverture"}
    </p>
  );
}

/**
 * Semaine complète, jour par jour (plus lisible qu'un regroupement pour
 * « est-ce ouvert jeudi soir ? »). Le jour courant est mis en avant, et
 * une barre montre l'amplitude de la journée sur une règle 8 h – 21 h.
 */
export function HoursWeek() {
  const now = useNow();
  const reduced = useReducedMotion();
  const today = now ? keys[now.getDay()] : null;
  const debut = 8 * 60;
  const fin = 21 * 60;
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const prochaines = now ? fermetures.filter((f) => f >= isoDate(now)).slice(0, 3) : [];

  return (
    <div>
      <dl className="divide-y divide-prune/10 border-y hairline">
        {site.hours.map((d, i) => {
          const ferme = d.ranges.length === 0;
          const isToday = today === d.day;
          return (
            <motion.div
              key={d.day}
              className={cn("relative grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4 py-3 sm:grid-cols-[7.5rem_9rem_minmax(0,1fr)]", isToday && "font-medium")}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: ease.veil }}
            >
              <dt className="flex items-center gap-2 capitalize">
                {isToday ? <span aria-hidden className="size-1.5 rounded-full bg-argile-deep" /> : null}
                {d.day}
                {isToday ? <span className="sr-only"> (aujourd&apos;hui)</span> : null}
              </dt>
              <dd className={cn("tabular", ferme ? "text-prune-mute" : "")}>
                {ferme ? "fermé" : d.ranges.map((r) => `${h(r.opens)} – ${h(r.closes)}`).join(", ")}
              </dd>
              <dd aria-hidden className="relative col-span-2 h-2 rounded-full bg-voile sm:col-span-1">
                {d.ranges.map((r) => (
                  <motion.span
                    key={r.opens}
                    className={cn("absolute inset-y-0 origin-left rounded-full", isToday ? "bg-argile-deep" : "bg-sauge")}
                    style={{ left: `${((toMin(r.opens) - debut) / (fin - debut)) * 100}%`, width: `${((toMin(r.closes) - toMin(r.opens)) / (fin - debut)) * 100}%` }}
                    initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
                    whileInView={reduced ? { opacity: 1 } : { scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.06, ease: ease.tide }}
                  />
                ))}
              </dd>
            </motion.div>
          );
        })}
      </dl>
      <div aria-hidden className="mt-2 hidden grid-cols-[7.5rem_9rem_minmax(0,1fr)] gap-4 text-[0.75rem] text-prune-mute sm:grid">
        <span className="col-start-3 relative h-4">
          {[8, 13, 17, 21].map((hh) => (
            <span key={hh} className="absolute -translate-x-1/2" style={{ left: `${((hh * 60 - debut) / (fin - debut)) * 100}%` }}>
              {hh} h
            </span>
          ))}
        </span>
      </div>
      <p className="mt-5 text-[0.95rem] text-prune-soft">{site.hoursNote} Aucun soin entre 13 h et 14 h : les praticiennes déjeunent.</p>
      {prochaines.length ? (
        <p className="mt-2 text-[0.95rem] text-prune-soft">
          Fermetures exceptionnelles :{" "}
          {prochaines.map((f) => fromIso(f).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })).join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
