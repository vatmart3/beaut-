"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site, fullAddress } from "@/config/site";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { ClipReveal, Float } from "@/components/effects/Reveal";
import { LineReveal } from "@/components/effects/LineReveal";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { Portrait } from "@/features/contenu/Portrait";
import { aEviter, alertes, auteur, etapes } from "./routine";

/** Styles d'impression : seule la fiche sort, en noir sur blanc, sans animation. */
const printCss = `
@media print {
  @page { margin: 14mm 16mm; }
  html, body { background: #fff !important; }
  body > *:not(main) { display: none !important; }
  main .pointer-events-none.fixed { display: none !important; }
  .frame:has(> #fiche-conseil) > :not(#fiche-conseil) { display: none !important; }
  .frame:has(> #fiche-conseil) { padding: 0 !important; }
  #fiche-conseil { border-radius: 0 !important; padding: 0 !important; background: #fff !important; }
  #fiche-conseil, #fiche-conseil * { color: #1d1418 !important; box-shadow: none !important; opacity: 1 !important; transform: none !important; filter: none !important; clip-path: none !important; }
  #fiche-conseil [data-print-hide] { display: none !important; }
  #fiche-conseil [data-print-only] { display: block !important; }
  #fiche-conseil .print-cols { display: block !important; }
  #fiche-conseil li, #fiche-conseil [data-print-block] { break-inside: avoid; page-break-inside: avoid; }
  #fiche-conseil h2 { break-after: avoid; margin-top: 8mm !important; }
  #fiche-conseil .bg-voile, #fiche-conseil .bg-argile-pale { background: #fff !important; border: 1px solid #bbb !important; }
}
`;

export function FicheRoutine() {
  const reduced = useReducedMotion();
  const [actif, setActif] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActif(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const e = etapes[actif];
  const t = etapes.length > 1 ? actif / (etapes.length - 1) : 0;
  const nuit = actif === etapes.length - 1;

  return (
    <section id="fiche-conseil" aria-label="La fiche conseil" className="shell px-5 py-12 sm:px-10 lg:px-16 lg:py-20">
      <style>{printCss}</style>

      {/* En-tête imprimé uniquement */}
      <div data-print-only className="hidden border-b border-black/30 pb-4">
        <p className="font-display text-[22pt] font-light leading-tight">Routine peau après une journée de mer</p>
        <p className="mt-1 text-[10pt]">
          Fiche conseil offerte par {site.fullName} — {fullAddress} — {site.contact.phone}
        </p>
        <p className="text-[10pt]">
          Par {auteur.prenom} {auteur.nom}, {auteur.role}.
        </p>
      </div>

      {/* Signature + impression */}
      <div className="flex flex-col gap-6 border-b hairline pb-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Portrait initiale={auteur.prenom[0]} teinte="argile" size="sm" className="w-16 shrink-0" />
          <p className="leading-snug">
            <span className="block font-display text-[1.1rem]">
              {auteur.prenom} {auteur.nom}
            </span>
            <span className="block text-[0.875rem] text-prune-soft">{auteur.role}</span>
          </p>
        </div>
        <div data-print-hide className="flex flex-wrap items-center gap-3">
          <Button onClick={() => window.print()} iconLeft="imprimer" variant="outline">
            Imprimer la fiche
          </Button>
          <p className="text-[0.8125rem] text-prune-mute">ou « Enregistrer en PDF » depuis la fenêtre d&apos;impression</p>
        </div>
      </div>

      {/* ——— La routine */}
      <div className="print-cols mt-14 grid gap-12 lg:grid-cols-12">
        <div data-print-hide aria-hidden className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-28">
            <svg viewBox="0 0 240 170" className="w-full max-w-[20rem] overflow-hidden rounded-[var(--radius-card)]">
              <motion.rect width="240" height="170" initial={false} animate={{ fill: nuit ? "#4A3942" : t > 0.5 ? "#EFE2D8" : "#F4EEE6" }} transition={{ duration: 1.2, ease: ease.tide }} />
              <motion.circle
                cx="120"
                r="22"
                initial={false}
                animate={{ cy: reduced ? 70 : 42 + t * 92, fill: nuit ? "#E8DDD0" : "#C9A48A" }}
                transition={{ duration: 1.4, ease: ease.veil }}
              />
              <rect y="112" width="240" height="58" fill={nuit ? "#3B2A33" : "#9CAF9A"} className="transition-[fill] duration-[1200ms] ease-[var(--ease-veil)]" />
              {[124, 138, 152].map((y, i) => (
                <path key={y} d={`M${10 + i * 14} ${y}c14-5 28-5 42 0s28 5 42 0 28-5 42 0 28 5 42 0`} fill="none" stroke="#FFFDFA" strokeOpacity={0.45 - i * 0.1} strokeWidth="1.2" />
              ))}
              <motion.ellipse cx="120" cy="120" rx="30" ry="3" initial={false} animate={{ opacity: nuit ? 0.2 : 0.55 - t * 0.3 }} fill="#FFFDFA" />
            </svg>
            <div className="mt-6 h-[5.5rem] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={e.heure}
                  className="tabular font-serif text-[5rem] leading-none tracking-[-0.02em]"
                  initial={reduced ? { opacity: 0 } : { y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.55, ease: ease.veil }}
                >
                  {e.heure}
                </motion.p>
              </AnimatePresence>
            </div>
            <p className="mt-2 text-prune-soft">
              {String(actif + 1).padStart(2, "0")} / {String(etapes.length).padStart(2, "0")} — {e.titre}
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <h2 className="font-display text-title font-light">La routine, minute par minute</h2>
          <p className="mt-3 max-w-[56ch] text-prune-soft">
            Pour une journée de plage finie vers 18 h 30. Décalez les heures, gardez l&apos;ordre : c&apos;est lui qui compte.
          </p>
          <ol className="mt-10">
            {etapes.map((x, i) => (
              <li
                key={x.heure}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-index={i}
                className="grid gap-3 border-t hairline py-8 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-8"
              >
                <div className="flex items-baseline gap-3 sm:block">
                  <p className={cn("tabular font-serif text-[1.9rem] leading-none transition-colors duration-[var(--dur-3)] ease-[var(--ease-veil)]", actif === i ? "text-argile-deep" : "text-prune")}>
                    {x.heure}
                  </p>
                  <p className="text-[0.8125rem] text-prune-mute sm:mt-2">{x.duree}</p>
                </div>
                <Float y={20}>
                  <h3 className="font-display text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)] font-light leading-tight">{x.titre}</h3>
                  <p className="mt-3 max-w-[60ch] leading-relaxed text-prune-soft">{x.texte}</p>
                  {x.attention ? (
                    <p data-print-block className="mt-4 flex max-w-[60ch] gap-3 rounded-[var(--radius-soft)] bg-argile-pale p-4 text-[0.95rem] leading-snug">
                      <Icon name="soleil" size={20} className="mt-0.5 shrink-0 text-argile-deep" />
                      {x.attention}
                    </p>
                  ) : null}
                </Float>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ——— À éviter */}
      <div className="print-cols mt-16 grid gap-10 border-t hairline pt-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <LineReveal as="h2" text="Ce qu'il vaut mieux éviter ce soir" className="font-display text-title font-light" />
        </div>
        <ul className="lg:col-span-8">
          {aEviter.map((x, i) => (
            <li key={x.titre} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 py-5">
              <span aria-hidden className="relative mt-4 block h-px w-full bg-prune/15">
                <motion.span
                  className="absolute inset-0 origin-left bg-argile-deep"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 1 }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: ease.tide }}
                />
              </span>
              <div>
                <h3 className="font-display text-[1.25rem] leading-snug">{x.titre}</h3>
                <p className="mt-1.5 max-w-[60ch] leading-relaxed text-prune-soft">{x.texte}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ——— Signaux d'alerte */}
      <ClipReveal className="mt-14" from="center">
        <div data-print-block className="rounded-[var(--radius-card)] bg-voile p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow text-argile-deep">Signaux d&apos;alerte</p>
              <h2 className="mt-3 font-display text-title font-light">Quand ce n&apos;est plus une affaire de crème</h2>
            </div>
            <div className="lg:col-span-8">
              <p className="leading-relaxed">Un coup de soleil sévère se soigne, il ne se cache pas sous une routine. Demandez conseil à un pharmacien le soir même, ou consultez un médecin, si vous observez :</p>
              <ul className="mt-5 space-y-3">
                {alertes.map((a) => (
                  <li key={a} className="flex gap-3 leading-snug">
                    <span aria-hidden className="mt-2 inline-block size-2 shrink-0 rounded-full bg-argile-deep" />
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-6 rounded-[var(--radius-soft)] border border-prune/20 bg-ecume p-4 font-medium leading-snug">
                Malaise, confusion, forte fièvre : appelez le 15 (ou le 112).
              </p>
              <p className="mt-4 text-[0.9rem] text-prune-soft">
                À l&apos;institut, nous ne faisons aucun soin sur un coup de soleil récent : attendez que la peau ait fini de peler, en général cinq à sept
                jours.
              </p>
            </div>
          </div>
        </div>
      </ClipReveal>

      <p data-print-only className="mt-6 hidden text-[9pt]">
        {site.fullName} · {fullAddress} · {site.contact.phone} · Conseils cosmétiques, ne remplacent pas un avis médical.
      </p>
    </section>
  );
}
