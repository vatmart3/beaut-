"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { site } from "@/config/site";
import { Input, Textarea, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { contactSchema, SUJETS, type ContactResponse, type ContactValues } from "./contact-schema";

const defaults: ContactValues = { nom: "", email: "", telephone: "", sujet: "soin", message: "", site: "" };

export function ContactForm() {
  const reduced = useReducedMotion();
  const [sent, setSent] = useState<{ demo: boolean; nom: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: defaults, mode: "onTouched" });

  const onSubmit = async (v: ContactValues) => {
    setError(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
      const data = (await res.json()) as ContactResponse;
      if (!data.ok) return setError(data.error);
      setSent({ demo: data.demo, nom: v.nom.split(" ")[0] });
      reset(defaults);
    } catch {
      setError(`La connexion a été interrompue. Réessayez, ou appelez-nous au ${site.contact.phone}.`);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="ok"
            role="status"
            className="relative overflow-hidden rounded-[var(--radius-card)] bg-sauge-pale p-8 sm:p-10"
            initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(40% 40% 40% 40% round 999px)" }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 28px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: ease.tide }}
          >
            <svg aria-hidden viewBox="0 0 200 60" className="absolute -right-6 bottom-6 w-64 text-sauge-deep/25">
              {[0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d={`M0 ${20 + i * 14}c16-10 34-10 50 0s34 10 50 0 34-10 50 0 34 10 50 0`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.6, delay: 0.4 + i * 0.2, ease: ease.veil }}
                />
              ))}
            </svg>
            <p className="eyebrow text-sauge-deep">Message reçu</p>
            <p className="mt-3 max-w-[22ch] font-display text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-light leading-[1.05] tracking-[-0.03em]">
              Merci{sent.nom ? `, ${sent.nom}` : ""}. Nous vous répondons {site.contact.responseTime}.
            </p>
            {sent.demo ? <p className="mt-4 text-[0.8125rem] text-prune-soft">Site de démonstration : aucun e-mail n&apos;a réellement été envoyé.</p> : null}
            <button
              type="button"
              onClick={() => setSent(null)}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-prune/25 px-5 font-display text-[0.9rem] transition-colors hover:border-prune hover:bg-prune hover:text-lait duration-[var(--dur-2)] ease-[var(--ease-veil)]"
            >
              <Icon name="enveloppe" size={16} />
              Écrire un autre message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: ease.veil }}
          >
            <Controller
              control={control}
              name="sujet"
              render={({ field }) => (
                <fieldset>
                  <legend className="font-display text-[0.9rem]">Votre message concerne</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SUJETS.map((s) => {
                      const on = field.value === s.id;
                      return (
                        <label
                          key={s.id}
                          className={cn(
                            "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-[0.9rem] transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-argile/35",
                            on ? "border-prune bg-prune text-lait" : "border-prune/20 hover:border-prune",
                          )}
                        >
                          <input type="radio" name={field.name} value={s.id} checked={on} onChange={() => field.onChange(s.id)} className="sr-only" />
                          {s.label}
                        </label>
                      );
                    })}
                  </div>
                  <FieldError id="sujet-error" error={errors.sujet?.message} />
                </fieldset>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Votre nom" autoComplete="name" error={errors.nom?.message} {...register("nom")} />
              <Input label="E-mail" type="email" inputMode="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
            </div>
            <Input label="Téléphone" optional type="tel" inputMode="tel" autoComplete="tel" hint="Si vous préférez un rappel." error={errors.telephone?.message} {...register("telephone")} />
            <Textarea label="Message" rows={5} maxLength={2000} error={errors.message?.message} {...register("message")} />
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Ne pas remplir
                <input type="text" tabIndex={-1} autoComplete="off" {...register("site")} />
              </label>
            </div>
            <p className="text-[0.8125rem] leading-relaxed text-prune-mute">
              Vos coordonnées servent uniquement à vous répondre. Elles ne sont ni revendues ni utilisées pour de la prospection.
            </p>
            {error ? (
              <p role="alert" className="rounded-[var(--radius-soft)] border border-[#8f2f2f]/30 bg-[#8f2f2f]/[0.06] p-4 text-[#7a2626]">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" icon={isSubmitting ? undefined : "fleche"} disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? "Envoi…" : "Envoyer"}
              </Button>
              <p className="text-[0.8125rem] text-prune-mute">Réponse {site.contact.responseTime}.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
