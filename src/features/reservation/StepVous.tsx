"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { site } from "@/config/site";
import { Checkbox, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { coordonneesDefaults, coordonneesSchema, type Coordonnees } from "./schema";

export function StepVous({
  initial,
  onSubmit,
  onChange,
  error,
}: {
  initial?: Coordonnees;
  onSubmit: (v: Coordonnees) => Promise<void>;
  /** Mémorise la saisie si l'on revient en arrière. */
  onChange: (v: Coordonnees) => void;
  error?: { message: string; creneau?: boolean; onRetry?: () => void } | null;
}) {
  const reduced = useReducedMotion();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Coordonnees>({
    resolver: zodResolver(coordonneesSchema),
    defaultValues: initial ?? coordonneesDefaults,
    mode: "onTouched",
  });
  const allergies = useWatch({ control, name: "sante.allergies" });
  const sante = useWatch({ control, name: "sante" });
  const signale = sante.grossesse || sante.allergies || sante.traitement || sante.circulation;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      onBlur={() => onChange(getValues())}
      className="grid gap-10"
      aria-describedby="rgpd-note"
    >
      <fieldset className="grid gap-5">
        <legend className="mb-4 font-display text-[1.2rem] font-light">Vos coordonnées</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Prénom" autoComplete="given-name" error={errors.prenom?.message} {...register("prenom")} />
          <Input label="Nom" autoComplete="family-name" error={errors.nom?.message} {...register("nom")} />
          <Input
            label="Téléphone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint="Pour la confirmation par SMS."
            error={errors.telephone?.message}
            {...register("telephone")}
          />
          <Input label="E-mail" type="email" inputMode="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        </div>
        {/* Pot de miel : invisible, ignoré par les humains */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Ne pas remplir
            <input type="text" tabIndex={-1} autoComplete="off" {...register("site")} />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-card)] bg-voile p-5 sm:p-7">
        <legend className="sr-only">Questionnaire santé</legend>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p aria-hidden className="font-display text-[1.2rem] font-light">
            Quatre questions pour adapter votre soin
          </p>
          <p className="text-[0.8125rem] text-prune-mute">Cochez ce qui vous concerne, rien d&apos;autre.</p>
        </div>
        <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
          <Checkbox label="Grossesse en cours" {...register("sante.grossesse")} />
          <Checkbox label="Traitement dermatologique en cours" {...register("sante.traitement")} />
          <Checkbox label="Allergies connues" {...register("sante.allergies")} />
          <Checkbox label="Problème circulatoire (phlébite, varices…)" {...register("sante.circulation")} />
        </div>
        <AnimatePresence initial={false}>
          {allergies ? (
            <motion.div
              initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: ease.veil }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <Input
                  label="Préciser l'allergène"
                  optional
                  placeholder="ex. fruits à coque, lanoline, nickel…"
                  maxLength={200}
                  error={errors.sante?.allergiesDetail?.message}
                  {...register("sante.allergiesDetail")}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {signale ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: ease.veil }}
              className="mt-4 flex items-start gap-2 text-[0.9rem] text-sauge-deep"
            >
              <Icon name="feuille" size={18} className="mt-0.5 shrink-0" />
              Merci. Nous adaptons le protocole, et nous vous appelons avant le rendez-vous si le soin doit changer.
            </motion.p>
          ) : null}
        </AnimatePresence>
        <p id="rgpd-note" className="mt-5 border-t hairline pt-4 text-[0.8125rem] leading-relaxed text-prune-soft">
          Ces informations servent uniquement à adapter votre soin ; elles ne sont pas conservées au-delà de l&apos;e-mail de demande.{" "}
          <Link href="/confidentialite#sante" className="underline underline-offset-4 hover:text-prune">
            En savoir plus
          </Link>
        </p>
      </fieldset>

      <div className="grid gap-5">
        <Checkbox
          label={
            <>
              J&apos;ai pris connaissance des conditions d&apos;annulation : <strong className="font-medium">{site.policies.cancellation}</strong>
            </>
          }
          error={errors.annulation?.message}
          {...register("annulation")}
        />
        <p className="flex items-start gap-2 text-[0.875rem] text-prune-soft">
          <Icon name="main" size={18} className="mt-0.5 shrink-0" />
          Aucun paiement en ligne. {site.policies.payment}
        </p>

        <AnimatePresence>
          {error ? (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: ease.veil }}
              className="rounded-[var(--radius-soft)] border border-[#8f2f2f]/30 bg-[#8f2f2f]/[0.06] p-4 text-[0.95rem] text-[#7a2626]"
            >
              {error.message}
              {error.onRetry ? (
                <button type="button" onClick={error.onRetry} className="ml-2 font-medium underline underline-offset-4">
                  Choisir un autre créneau
                </button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" icon={isSubmitting ? undefined : "fleche"} disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-3">
                <SendingDrop />
                Envoi de votre demande…
              </span>
            ) : (
              "Envoyer ma demande"
            )}
          </Button>
          <p className="text-[0.8125rem] text-prune-mute">Réponse {site.contact.responseTime}, par SMS ou e-mail.</p>
        </div>
      </div>
    </form>
  );
}

function SendingDrop() {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="inline-block"
      animate={reduced ? undefined : { y: [0, 5, 0], scaleY: [1, 0.85, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: ease.float }}
    >
      <Icon name="goutte" size={18} />
    </motion.span>
  );
}
