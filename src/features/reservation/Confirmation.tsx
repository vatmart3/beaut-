"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site, mapsUrl, fullAddress } from "@/config/site";
import { fromIso } from "@/data/planning";
import { formatDuree, formatPrix } from "@/data/soins";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { RippleCanvas } from "@/components/effects/RippleCanvas";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { libellePraticienne, type ChoixPraticienne, type Prestation } from "./schema";
import { heureFr, jourLong } from "./slots";
import { buildIcs, downloadIcs } from "./ics";

export function Confirmation({
  reference,
  demo,
  presta,
  choix,
  attribuee,
  date,
  heure,
  prenom,
  onReset,
}: {
  reference: string;
  demo: boolean;
  presta: Prestation;
  choix: ChoixPraticienne;
  attribuee?: string;
  date: string;
  heure: string;
  prenom: string;
  onReset: () => void;
}) {
  const reduced = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [ripple, setRipple] = useState(0);
  const [saved, setSaved] = useState(false);
  const jour = jourLong(fromIso(date));
  const praticienne = libellePraticienne(choix, attribuee);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    const t = window.setTimeout(() => setRipple(1), reduced ? 0 : 650);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const ajouterAgenda = () => {
    const ics = buildIcs({
      uid: `${reference}@brume-institut`,
      date,
      heure,
      duree: presta.duree,
      titre: `${presta.label} — ${site.name} (à confirmer)`,
      lieu: `${site.fullName}, ${fullAddress}`,
      description: [
        `Demande ${reference} — en attente de confirmation par l'institut (${site.contact.responseTime}).`,
        `Praticienne : ${praticienne}.`,
        `Durée : ${formatDuree(presta.duree)} · ${formatPrix(presta.prix)}, réglé sur place.`,
        site.policies.cancellation,
        `Téléphone : ${site.contact.phone}`,
      ].join("\n"),
    });
    downloadIcs(`brume-${reference}.ics`, ics);
    setSaved(true);
  };

  const rise = (d: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay: d * 0.3 } }
      : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.5 + d * 0.12, ease: ease.veil } };

  return (
    <div className="relative">
      <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] bg-sauge-pale px-5 pb-10 pt-14 sm:px-10 sm:pt-20 lg:px-14">
        <RippleCanvas trigger={ripple} origin={{ x: 0.12, y: 0.22 }} light="#FFFDFA" shadow="#9CAF9A" duration={2.8} />
        {/* La goutte tombe et touche la surface */}
        <motion.svg
          aria-hidden
          width="40"
          height="50"
          viewBox="0 0 32 40"
          className="relative text-sauge-deep"
          initial={reduced ? { opacity: 0 } : { y: -140, opacity: 0, scaleY: 1.2 }}
          animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, scaleY: [1.2, 1.2, 0.8, 1] }}
          transition={reduced ? { duration: 0.3 } : { duration: 0.75, ease: ease.fall, scaleY: { duration: 0.95, times: [0, 0.75, 0.88, 1] } }}
        >
          <path d="M16 2.5C22 11 27.5 18 27.5 26a11.5 11.5 0 1 1-23 0C4.5 18 10 11 16 2.5Z" fill="currentColor" />
          <path d="M11.2 26.6c1.5 1 2.6 2.1 3.4 3.6 1.9-3.8 4.4-6.5 7.8-8.5" fill="none" stroke="#FFFDFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>

        <motion.h2
          ref={titleRef}
          tabIndex={-1}
          className="relative mt-6 max-w-[18ch] font-display text-[clamp(2.25rem,1.4rem+3.6vw,4.5rem)] font-light leading-[0.98] tracking-[-0.04em] outline-none"
          {...rise(0)}
        >
          Demande envoyée, {prenom}.
        </motion.h2>
        <motion.p className="relative mt-5 max-w-[46ch] text-lead text-prune-soft" {...rise(1)}>
          Nous vérifions le planning et vous confirmons le rendez-vous par SMS ou e-mail {site.contact.responseTime}.
        </motion.p>
        <motion.p className="relative mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1" {...rise(2)}>
          <span className="eyebrow text-prune-mute">Référence</span>
          <span className="tabular select-all font-serif text-[1.6rem] tracking-[0.02em]">{reference}</span>
        </motion.p>
        {demo ? (
          <motion.p className="relative mt-4 inline-flex rounded-full border border-prune/20 bg-ecume/70 px-4 py-2 text-[0.8125rem] text-prune-soft" {...rise(3)}>
            Site de démonstration : aucun e-mail n&apos;a réellement été envoyé.
          </motion.p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-12">
        {/* Ticket */}
        <motion.section aria-labelledby="conf-rdv" className="rounded-[var(--radius-card)] border hairline bg-ecume p-6 sm:p-8 lg:col-span-7" {...rise(3)}>
          <h3 id="conf-rdv" className="eyebrow text-argile-deep">
            Votre rendez-vous
          </h3>
          <p className="mt-4 font-display text-[1.6rem] font-light leading-tight first-letter:uppercase">
            {jour}, {heureFr(heure)}
          </p>
          <dl className="mt-5 grid gap-x-8 gap-y-3 text-[0.95rem] sm:grid-cols-2">
            {[
              ["Soin", presta.label],
              ["Praticienne", praticienne],
              ["Durée", formatDuree(presta.duree)],
              ["Prix", `${formatPrix(presta.prix)}${presta.personnes === 2 ? " pour deux" : ""}, réglé sur place`],
              ["Adresse", fullAddress],
            ].map(([k, v]) => (
              <div key={k} className={k === "Adresse" ? "sm:col-span-2" : undefined}>
                <dt className="text-[0.8125rem] text-prune-mute">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex flex-wrap gap-2">
            <Button onClick={ajouterAgenda} iconLeft={saved ? "check" : "calendrier"} variant="solid">
              {saved ? "Fichier agenda téléchargé" : "Ajouter à mon agenda"}
            </Button>
            <Button href={mapsUrl} variant="outline" iconLeft="itineraire">
              Itinéraire
            </Button>
            <Button href={site.contact.phoneHref} variant="ghost" iconLeft="telephone">
              {site.contact.phone}
            </Button>
          </div>
          <p className="mt-3 text-[0.8125rem] text-prune-mute">
            Le fichier .ics s&apos;ouvre dans Calendrier, Google Agenda ou Outlook. L&apos;événement reste « à confirmer » jusqu&apos;à notre message.
          </p>
        </motion.section>

        <div className="grid gap-3 lg:col-span-5">
          <motion.section aria-labelledby="conf-avant" className="rounded-[var(--radius-card)] bg-voile p-6 sm:p-8" {...rise(4)}>
            <h3 id="conf-avant" className="eyebrow text-argile-deep">
              Avant votre soin
            </h3>
            <ol className="mt-4 space-y-3">
              {[...presta.soin.avant, "Arrivez 10 minutes avant pour vous installer ; la tisanerie vous attend après."].map((a, i) => (
                <li key={a} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 leading-snug">
                  <span className="tabular font-serif text-prune-mute">{String(i + 1).padStart(2, "0")}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </motion.section>
          <motion.section aria-labelledby="conf-annul" className="rounded-[var(--radius-card)] border border-dashed border-prune/25 p-6 sm:p-8" {...rise(5)}>
            <h3 id="conf-annul" className="eyebrow text-argile-deep">
              Un empêchement ?
            </h3>
            <p className="mt-3 leading-snug">
              {site.policies.cancellation} Un appel au{" "}
              <a href={site.contact.phoneHref} className="whitespace-nowrap underline underline-offset-4">
                {site.contact.phone}
              </a>{" "}
              ou un e-mail en rappelant votre référence suffit.
            </p>
          </motion.section>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-display text-[0.95rem] text-prune-soft underline decoration-prune/25 underline-offset-4 transition-colors hover:text-prune hover:decoration-prune duration-[var(--dur-2)] ease-[var(--ease-veil)]"
        >
          <Icon name="retour" size={16} />
          Faire une autre demande
        </button>
      </div>
    </div>
  );
}
