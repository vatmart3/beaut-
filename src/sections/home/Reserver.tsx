"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { soins, getSoin, formatDuree, formatPrix } from "@/data/soins";
import { creneaux, creneauxRestantsSemaine, joursDisponibles, isoDate, formatJour } from "@/data/planning";
import { getPraticienne } from "@/data/praticiennes";
import { site, mapsUrl } from "@/config/site";
import { Icon } from "@/components/icons/Icon";
import { Counter } from "@/components/effects/Reveal";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const favoris = ["hydratation-profonde", "modelage-relaxant", "rituel-thau", "modelage-duo"].map((s) => getSoin(s)!);

/** Prochain créneau réel (planning), calculé sur l'heure du visiteur. */
function prochainCreneau(slug: string, now: Date) {
  const soin = getSoin(slug)!;
  for (const d of joursDisponibles(now, 14)) {
    const iso = isoDate(d);
    const c = creneaux(iso, soin.duree, "indifferent", soin.personnes ?? 1, now);
    if (c.length) return { date: d, iso, ...c[0] };
  }
  return null;
}

/**
 * Réserver en trois gestes : choisir un soin, voir le vrai prochain créneau,
 * le prendre. Rareté réelle (créneaux restants cette semaine).
 */
export function Reserver() {
  const [slug, setSlug] = useState(favoris[0].slug);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setNow(new Date()));
    return () => cancelAnimationFrame(id);
  }, []);
  const next = useMemo(() => (now ? prochainCreneau(slug, now) : null), [slug, now]);
  const restants = useMemo(() => (now ? creneauxRestantsSemaine(now) : null), [now]);
  const soin = getSoin(slug)!;
  const praticienne = next && next.praticienne !== "duo" ? getPraticienne(next.praticienne) : null;
  const href = next ? `/reserver?soin=${slug}&date=${next.iso}&heure=${next.heure.replace(":", "h")}` : `/reserver?soin=${slug}`;

  return (
    <section aria-labelledby="reserver-title" className="shell relative overflow-hidden px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-argile-deep">Réserver</p>
          <h2 id="reserver-title" className="mt-5 font-display text-[clamp(2.25rem,1.2rem+3.4vw,4.75rem)] font-light leading-[0.98] tracking-[-0.045em]">
            Trois gestes, et c&apos;est noté.
          </h2>
          <p className="mt-6 max-w-[40ch] text-lead text-prune-soft">
            Aucun acompte, aucun compte à créer. Vous réglez sur place, après le soin. Confirmation {site.contact.responseTime}.
          </p>
          {restants !== null ? (
            <p className="mt-10 flex items-baseline gap-3">
              <Counter to={restants} className="font-serif text-[3.5rem] leading-none" />
              <span className="max-w-[20ch] text-[0.95rem] text-prune-soft">créneaux d&apos;une heure encore libres sur les 7 prochains jours</span>
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-2">
            <a href={site.contact.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-prune/30 px-5 font-display text-[0.9rem] hover:border-prune">
              <Icon name="telephone" size={18} />
              {site.contact.phone}
            </a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-prune/30 px-5 font-display text-[0.9rem] hover:border-prune">
              <Icon name="itineraire" size={18} />
              Itinéraire
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ol className="space-y-3">
            <li className="rounded-[var(--radius-card)] bg-lait p-5 sm:p-7">
              <p className="flex items-center gap-3 font-display text-[0.9rem] text-prune-soft">
                <span className="grid size-7 place-items-center rounded-full bg-prune font-serif text-[0.9rem] text-lait">1</span>
                Choisissez un soin
              </p>
              <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Soin">
                {favoris.map((f) => (
                  <button
                    key={f.slug}
                    type="button"
                    role="radio"
                    aria-checked={slug === f.slug}
                    onClick={() => setSlug(f.slug)}
                    className={cn(
                      "min-h-11 rounded-full border px-4 font-display text-[0.9rem] transition-[background-color,color,border-color] duration-[var(--dur-2)] ease-[var(--ease-veil)]",
                      slug === f.slug ? "border-prune bg-prune text-lait" : "border-prune/25 hover:border-prune",
                    )}
                  >
                    {f.nom}
                  </button>
                ))}
                <Link href="/reserver" className="inline-flex min-h-11 items-center px-3 font-display text-[0.9rem] underline decoration-prune/30 underline-offset-4">
                  {soins.length - favoris.length} autres soins
                </Link>
              </div>
            </li>
            <li className="rounded-[var(--radius-card)] bg-lait p-5 sm:p-7">
              <p className="flex items-center gap-3 font-display text-[0.9rem] text-prune-soft">
                <span className="grid size-7 place-items-center rounded-full bg-prune font-serif text-[0.9rem] text-lait">2</span>
                Le prochain créneau libre
              </p>
              <motion.div key={slug + (next?.iso ?? "")} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: ease.veil }} className="mt-4" aria-live="polite">
                {next ? (
                  <p className="font-display text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-light leading-tight tracking-[-0.03em]">
                    <span className="first-letter:uppercase">{formatJour(next.date)}</span>, à {next.heure.replace(":", " h ")}
                    <span className="mt-1 block text-[0.95rem] font-normal tracking-normal text-prune-soft">
                      {soin.nom} · {formatDuree(soin.duree)} · {formatPrix(soin.prix)}
                      {praticienne ? ` · avec ${praticienne.prenom}` : soin.personnes === 2 ? " · cabine duo" : ""}
                    </span>
                  </p>
                ) : (
                  <p className="text-prune-soft">Calcul des disponibilités…</p>
                )}
              </motion.div>
            </li>
            <li>
              <Link
                href={href}
                className="group flex min-h-16 items-center justify-between gap-4 rounded-[var(--radius-card)] bg-prune p-5 pl-7 text-lait transition-colors hover:bg-[#000000] sm:p-6 sm:pl-8"
              >
                <span className="flex items-center gap-3 font-display text-[1.1rem]">
                  <span className="grid size-7 place-items-center rounded-full bg-lait font-serif text-[0.9rem] text-prune">3</span>
                  Prendre ce créneau
                </span>
                <span className="grid size-11 place-items-center rounded-full bg-lait text-prune transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:translate-x-1">
                  <Icon name="fleche" size={18} />
                </span>
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
