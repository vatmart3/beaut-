"use client";

import { motion } from "motion/react";
import { Icon } from "@/components/icons/Icon";
import { occasionDuMoment } from "@/data/bons-cadeaux";
import { useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import { ENVOI_MAX_JOURS, formatDateLong, fromKey, toKey } from "./model";
import { useTodayKey } from "./useToday";

const nomAvecArticle = { "saint-valentin": "la Saint-Valentin", "fete-des-meres": "la fête des mères", noel: "Noël" } as const;

export function quandLabel(jours: number) {
  return jours === 0 ? "aujourd'hui" : jours === 1 ? "demain" : `dans ${jours} jours`;
}

/**
 * Occasion du moment, calculée sur la date réelle du visiteur (côté client) :
 * bandeau éditorial pendant la fenêtre qui précède la date, simple mention
 * de la prochaine occasion le reste de l'année. Pas de compte à rebours.
 */
export function OccasionNote() {
  const key = useTodayKey();
  const reduced = useReducedMotion();
  if (!key) return <div aria-hidden className="min-h-8" />;

  const occ = occasionDuMoment(fromKey(key));
  const dateLabel = formatDateLong(toKey(occ.date), { year: false });
  const quand = quandLabel(occ.jours);

  if (!occ.active) {
    return (
      <motion.p
        className="flex max-w-md items-start gap-3 text-caption text-prune-mute"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: ease.float, delay: 0.6 }}
      >
        <Icon name="calendrier" size={18} className="mt-px shrink-0" />
        <span>
          Prochaine occasion : {nomAvecArticle[occ.o.id]}, le {dateLabel} ({quand}). Un bon cadeau n&apos;attend pas de
          date pour autant.
        </span>
      </motion.p>
    );
  }

  return (
    <motion.aside
      aria-label={`Occasion : ${occ.o.label}`}
      className="relative max-w-xl overflow-hidden rounded-[var(--radius-card)] bg-argile-pale p-6 sm:p-8"
      initial={reduced ? { opacity: 0 } : { clipPath: "inset(0% 100% 0% 0% round 28px)" }}
      animate={reduced ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0% round 28px)" }}
      transition={{ duration: 1.2, ease: ease.tide, delay: 0.4 }}
    >
      <svg aria-hidden viewBox="0 0 200 80" className="pointer-events-none absolute -right-8 -bottom-6 w-56 text-argile-deep/25">
        {[10, 24, 40, 58, 78].map((r) => (
          <ellipse key={r} cx="120" cy="60" rx={r} ry={r * 0.32} fill="none" stroke="currentColor" strokeWidth="1" />
        ))}
      </svg>
      <p className="eyebrow flex items-center gap-2 text-argile-deep">
        <Icon name="cadeau" size={16} />
        {occ.o.label}
      </p>
      <p className="relative mt-4 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] font-light leading-[1.1] tracking-[-0.03em]">
        {occ.o.phrase} — <span className="font-serif">{dateLabel}</span>, {quand}.
      </p>
      <p className="relative mt-3 max-w-[46ch] text-[0.95rem] text-prune-soft">
        {occ.jours <= ENVOI_MAX_JOURS
          ? `Choisissez l'envoi par e-mail et la date du ${dateLabel} : le bon arrivera le matin même, à 9 h.`
          : `L'envoi par e-mail se programme jusqu'à ${ENVOI_MAX_JOURS} jours à l'avance ; le PDF, lui, s'imprime dès aujourd'hui.`}
      </p>
      <a
        href="#composer"
        className="group relative mt-5 inline-flex min-h-11 items-center gap-2 font-display text-[0.95rem] underline decoration-prune/30 underline-offset-[6px] transition-colors hover:decoration-prune"
      >
        Composer le bon
        <Icon name="fleche" size={18} className="transition-transform duration-[var(--dur-2)] ease-[var(--ease-veil)] group-hover:translate-x-1" />
      </a>
    </motion.aside>
  );
}
