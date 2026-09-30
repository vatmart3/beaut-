"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { formatPrix } from "@/data/soins";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import type { CardData } from "./cardArt";
import { CardPreview } from "./CardPreview";
import { formatDateLong, type GiftValues } from "./model";

export interface Done {
  values: GiftValues;
  card: CardData;
  prix: number | null;
  demo: boolean;
  scheduledAt: string | null;
  pdfError: boolean;
}

function describe(d: CardData) {
  return `Votre bon cadeau : ${d.titre}, pour ${d.pour}, de la part de ${d.de}. Code ${d.code}, valable jusqu'au ${d.validite}.`;
}

/** Écran de succès : la carte se pose, récapitulatif, code, suite des opérations. */
export function SuccessPanel({ done, onRestart }: { done: Done; onRestart: () => void }) {
  const reduced = useReducedMotion();
  const title = useRef<HTMLHeadingElement>(null);
  const [pdf, setPdf] = useState<"idle" | "loading" | "error" | "ok">(done.pdfError ? "error" : done.values.remise === "pdf" ? "ok" : "idle");
  const [copied, setCopied] = useState(false);
  const { values: v, card } = done;

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, []);

  const download = async () => {
    setPdf("loading");
    try {
      const { genererPdf } = await import("./pdf");
      await genererPdf(card);
      setPdf("ok");
    } catch {
      setPdf("error");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(card.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* presse-papiers indisponible : le code reste sélectionnable */
    }
  };

  const envoi =
    v.remise === "email"
      ? done.scheduledAt
        ? `le ${formatDateLong(v.dateEnvoi, { year: false })} à 9 h`
        : "dans quelques minutes"
      : null;

  const item = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: ease.veil } },
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <motion.div className="lg:col-span-6" initial="hidden" animate="show" transition={{ staggerChildren: reduced ? 0 : 0.08, delayChildren: 0.15 }}>
        <motion.p variants={item} className="eyebrow flex items-center gap-2 text-sauge-deep">
          <Icon name="check" size={16} strokeWidth={1.8} />
          C&apos;est noté
        </motion.p>
        <motion.h2
          variants={item}
          ref={title}
          tabIndex={-1}
          id="bon-succes-titre"
          className="mt-4 font-display text-[clamp(2.25rem,1.4rem+3.4vw,4.5rem)] font-light leading-[1] tracking-[-0.045em] focus:outline-none"
        >
          Le bon de {v.pour} est réservé.
        </motion.h2>
        <motion.p variants={item} className="mt-5 max-w-[48ch] text-lead text-prune-soft">
          {v.remise === "pdf"
            ? pdf === "error"
              ? "Le PDF n'a pas pu être généré automatiquement : utilisez le bouton ci-dessous."
              : "Le PDF vient d'être téléchargé : imprimez-le, pliez-le en deux, glissez-le dans une enveloppe."
            : `Il partira chez ${v.emailDestinataire} ${envoi}. Une confirmation vous attend dans votre boîte e-mail.`}
        </motion.p>

        <motion.dl variants={item} className="mt-10 grid gap-x-8 gap-y-6 border-t hairline pt-8 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="eyebrow text-prune-mute">Code du bon</dt>
            <dd className="mt-2 flex flex-wrap items-center gap-3">
              <span className="select-all font-display text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-normal tracking-[0.04em] tabular">{card.code}</span>
              <button
                type="button"
                onClick={copy}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-prune/25 px-4 text-[0.875rem] transition-colors hover:border-prune hover:bg-prune hover:text-lait"
              >
                <Icon name={copied ? "check" : "plus"} size={16} />
                <span aria-live="polite">{copied ? "Copié" : "Copier le code"}</span>
              </button>
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-prune-mute">Valeur</dt>
            <dd className="mt-2 font-serif text-[1.35rem] leading-snug">
              {card.estSoin ? card.titre : null}
              {card.estSoin ? <span className="block font-sans text-caption text-prune-mute">{card.detail}</span> : null}
              {done.prix !== null ? <span className={card.estSoin ? "mt-1 block" : ""}>{formatPrix(done.prix)}</span> : null}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-prune-mute">Valable jusqu&apos;au</dt>
            <dd className="mt-2 font-serif text-[1.35rem]">{card.validite}</dd>
          </div>
        </motion.dl>

        <motion.div variants={item} className="mt-10">
          <h3 className="font-display text-[1.15rem]">La suite</h3>
          <ol className="mt-4 space-y-4">
            {[
              `Nous vous appelons ${site.contact.responseTime} au ${v.telephone} pour le règlement. Vous pouvez aussi régler directement à l'institut, du mardi au samedi.`,
              "Dès réception du règlement, le code est activé : il suffit de le donner à la réservation.",
              v.remise === "pdf"
                ? "Vous préférez une vraie enveloppe ? Passez à l'institut : nous vous remettons le bon imprimé dans une enveloppe en papier ensemencé."
                : `Si le règlement n'a pas eu lieu avant le ${formatDateLong(v.dateEnvoi, { year: false })}, nous décalons l'envoi avec vous, par téléphone.`,
            ].map((t, i) => (
              <li key={i} className="flex gap-4">
                <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-sable font-serif text-[0.95rem] tabular">
                  {i + 1}
                </span>
                <p className="pt-1 text-prune-soft">{t}</p>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div variants={item} className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button onClick={download} disabled={pdf === "loading"} iconLeft="imprimer" aria-busy={pdf === "loading"} className="w-full sm:w-auto">
            {pdf === "loading" ? "Préparation du PDF…" : v.remise === "pdf" ? "Télécharger à nouveau le PDF" : "Télécharger aussi le PDF"}
          </Button>
          <Button variant="outline" onClick={onRestart} iconLeft="cadeau" className="w-full sm:w-auto">
            Composer un autre bon
          </Button>
        </motion.div>
        {pdf === "error" ? (
          <p role="alert" className="mt-4 text-[0.9rem] text-[#8f2f2f]">
            Le PDF n&apos;a pas pu être créé sur cet appareil. Réessayez, ou demandez-le nous : nous vous l&apos;enverrons par e-mail.
          </p>
        ) : null}
        {done.demo ? (
          <p className="mt-8 max-w-[60ch] text-caption text-prune-mute">
            Site de démonstration : la demande a été simulée, aucun e-mail n&apos;a réellement été envoyé.
          </p>
        ) : null}
      </motion.div>

      <div className="lg:col-span-6">
        <div className="rounded-[var(--radius-card)] bg-voile px-2 pb-5 pt-2 sm:px-4 lg:sticky lg:top-28">
          <CardPreview data={card} description={describe(card)} landing />
        </div>
      </div>
    </div>
  );
}
