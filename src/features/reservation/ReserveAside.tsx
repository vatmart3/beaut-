"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { site } from "@/config/site";
import { creneauxRestantsSemaine } from "@/data/planning";
import { Counter } from "@/components/effects/Reveal";
import { Button } from "@/components/ui/Button";
import { ease } from "@/lib/motion";
import { useNow } from "./useNow";

/**
 * Rareté réelle (créneaux d'une heure encore libres sur 7 jours, calculés
 * sur le planning à l'heure du navigateur) + alternative téléphone.
 */
export function ReserveAside() {
  const now = useNow();
  const restants = useMemo(() => (now ? creneauxRestantsSemaine(now) : null), [now]);

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center lg:grid-cols-1">
      <motion.div
        className="galet grid aspect-[6/5] w-44 place-items-center bg-sauge-pale shadow-[var(--shadow-galet)]"
        initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.1, delay: 0.5, ease: ease.veil }}
      >
        <p className="px-4 text-center leading-tight">
          <span className="sr-only">{restants === null ? "Calcul des créneaux restants" : `Il reste ${restants} créneaux cette semaine`}</span>
          <span aria-hidden className="block font-serif text-[3.25rem] leading-none text-sauge-deep">
            {restants === null ? "··" : <Counter to={restants} />}
          </span>
          <span aria-hidden className="mt-1 block text-[0.8125rem] text-prune-soft">
            créneaux libres
            <br />
            cette semaine
          </span>
        </p>
      </motion.div>
      <div>
        <p className="text-[0.95rem] leading-relaxed text-prune-soft">
          {restants !== null && restants < 25 ? "La semaine se remplit. " : ""}Plutôt de vive voix ? Nous réservons avec vous par téléphone, aux heures
          d&apos;ouverture.
        </p>
        <div className="mt-4">
          <Button href={site.contact.phoneHref} variant="outline" iconLeft="telephone" size="sm">
            {site.contact.phone}
          </Button>
        </div>
      </div>
    </div>
  );
}
