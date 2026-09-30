"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { getPraticienne } from "@/data/praticiennes";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { Portrait } from "@/features/contenu/Portrait";
import { choixPour, type ChoixPraticienne, type Prestation } from "./schema";
import { heureFr, jourCourt, premierCreneau } from "./slots";

export function StepPraticienne({
  presta,
  choix,
  now,
  onChoose,
}: {
  presta: Prestation;
  choix?: ChoixPraticienne;
  now: Date | null;
  onChoose: (c: ChoixPraticienne) => void;
}) {
  const reduced = useReducedMotion();
  const options = useMemo(() => choixPour(presta.soin), [presta.soin]);
  const prochains = useMemo(() => {
    if (!now) return {} as Record<string, string>;
    return Object.fromEntries(
      options.map((o) => {
        const p = premierCreneau(presta.duree, o, now);
        return [o, p ? `Dès ${jourCourt(p.date)}, ${heureFr(p.heure)}` : "Complet sur 3 semaines — appelez-nous"];
      }),
    ) as Record<string, string>;
  }, [now, options, presta.duree]);

  const seule = options.length === 1 && options[0] !== "duo" ? getPraticienne(options[0]) : undefined;

  const appear = (i: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.08 * i, ease: ease.veil } };

  return (
    <div>
      {seule ? (
        <p className="mb-6 max-w-[52ch] text-prune-soft">
          {presta.soin.nom} est réalisé uniquement par {seule.prenom} : c&apos;est l&apos;une de ses spécialités.
        </p>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => {
          const on = choix === o;
          if (o === "indifferent" || o === "duo") {
            return (
              <motion.li key={o} className="sm:col-span-2" {...appear(i)}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChoose(o)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-[var(--radius-card)] sm:gap-5 border p-4 text-left transition-[background-color,border-color,color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-veil)] sm:p-5",
                    on ? "border-prune bg-prune text-lait shadow-[var(--shadow-veil)]" : "border-dashed border-prune/35 bg-ecume hover:border-solid hover:border-prune",
                  )}
                >
                  <span aria-hidden className="relative h-12 w-[4.5rem] shrink-0 sm:h-16 sm:w-24">
                    <Portrait initiale="C" teinte="argile" size="sm" className="absolute left-0 top-0 w-10 sm:w-14 transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:-translate-x-1 group-hover:-rotate-6" />
                    <Portrait initiale="I" teinte="sauge" size="sm" className="absolute left-7 top-1 w-10 sm:left-9 sm:w-14 transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:translate-x-1 group-hover:rotate-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.2rem] leading-tight">{o === "duo" ? "Clémence et Inès, ensemble" : "Peu importe"}</span>
                    <span className={cn("mt-1 block text-[0.9rem] leading-snug", on ? "text-lait/80" : "text-prune-soft")}>
                      {o === "duo"
                        ? "Deux tables côte à côte en cabine duo, gestes accordés. Nous cherchons un moment où elles sont libres toutes les deux."
                        : "Le premier créneau libre, avec l'une ou l'autre. C'est l'option qui offre le plus de disponibilités."}
                    </span>
                    <Next label={prochains[o]} on={on} />
                  </span>
                  <Arrow on={on} />
                </button>
              </motion.li>
            );
          }
          const p = getPraticienne(o)!;
          return (
            <motion.li key={o} {...appear(i)}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onChoose(o)}
                className={cn(
                  "group grid h-full w-full grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-4 rounded-[var(--radius-card)] border p-4 text-left transition-[background-color,border-color,color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-veil)] sm:p-5",
                  on ? "border-prune bg-prune text-lait shadow-[var(--shadow-veil)]" : "border-prune/15 bg-ecume hover:border-prune",
                )}
              >
                <Portrait
                  initiale={p.prenom[0]}
                  teinte={p.teinte}
                  className="w-[5.5rem] transition-transform duration-[var(--dur-4)] ease-[var(--ease-veil)] group-hover:-rotate-3 group-hover:scale-[1.03]"
                />
                <span className="min-w-0">
                  <span className="block font-display text-[1.2rem] leading-tight">{p.prenom}</span>
                  <span className={cn("block text-[0.8125rem]", on ? "text-lait/75" : "text-prune-mute")}>{p.role}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {p.specialites.map((s) => (
                      <span key={s} className={cn("rounded-full border px-2.5 py-0.5 text-[0.75rem]", on ? "border-lait/30" : "border-prune/20")}>
                        {s}
                      </span>
                    ))}
                  </span>
                  <Next label={prochains[o]} on={on} />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      {choix && options.includes(choix) ? (
        <div className="mt-6">
          <Button onClick={() => onChoose(choix)} icon="fleche">
            Continuer vers les créneaux
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Next({ label, on }: { label?: string; on: boolean }) {
  return (
    <span className={cn("mt-3 flex items-center gap-1.5 text-[0.8125rem]", on ? "text-lait/85" : "text-sauge-deep")}>
      <Icon name="horloge" size={15} />
      {label ?? "Calcul des disponibilités…"}
    </span>
  );
}

function Arrow({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "hidden size-10 shrink-0 place-items-center rounded-full transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:translate-x-1 sm:grid",
        on ? "bg-lait/15" : "bg-prune/5",
      )}
    >
      <Icon name={on ? "check" : "fleche"} size={16} />
    </span>
  );
}
