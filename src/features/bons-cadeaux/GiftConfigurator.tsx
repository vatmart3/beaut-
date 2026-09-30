"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { site } from "@/config/site";
import { genererCode, montantsSuggeres, motifs, occasionDuMoment } from "@/data/bons-cadeaux";
import { categories, formatDuree, formatPrix, getSoin, prixDepart, soins, type CategorieId } from "@/data/soins";
import { Button } from "@/components/ui/Button";
import { Checkbox, FieldError, Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/icons/Icon";
import { ClipReveal } from "@/components/effects/Reveal";
import { Compose } from "@/components/effects/LineReveal";
import { useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { CardData } from "./cardArt";
import { CardPreview } from "./CardPreview";
import {
  ENVOI_MAX_JOURS,
  MESSAGE_MAX,
  addDaysKey,
  formatDateLong,
  fromKey,
  giftDefaults,
  giftSchema,
  motifDe,
  toKey,
  validiteKey,
  valeurDuBon,
  type GiftInput,
  type GiftValues,
} from "./model";
import { OFFRIR_EVENT } from "./sections";
import { SuccessPanel, type Done } from "./SuccessPanel";
import { Drop, MotifMini, RadioCard, Step } from "./ui";
import { useTodayKey } from "./useToday";

const { giftMin, giftMax } = site.policies;
const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Lit `?soin=<slug>` (doit vivre dans un <Suspense>). */
function SoinParam({ onSoin }: { onSoin: (slug: string) => void }) {
  const slug = useSearchParams().get("soin");
  useEffect(() => {
    if (slug) onSoin(slug);
  }, [slug, onSoin]);
  return null;
}

export function cardDataFrom(v: Partial<GiftInput>, todayKey: string | null): CardData {
  const valeur = valeurDuBon({ type: v.type ?? "montant", montant: v.montant ?? "", soin: v.soin ?? "", variante: v.variante ?? "" });
  return {
    motif: v.motif ?? "galets",
    titre: valeur.titre,
    detail: valeur.detail,
    estSoin: (v.type ?? "montant") === "soin",
    de: (v.de ?? "").trim(),
    pour: (v.pour ?? "").trim(),
    message: v.message ?? "",
    code: v.code ?? "",
    validite: todayKey ? formatDateLong(validiteKey(todayKey), { weekday: false }) : "—",
  };
}

export function describeCard(d: CardData) {
  return [
    `Aperçu du bon cadeau, motif ${motifDe(d.motif).label}.`,
    `Recto : BRUME, ${d.titre}, ${d.detail}.`,
    `Verso : pour ${d.pour || "(prénom à indiquer)"}, de la part de ${d.de || "(prénom à indiquer)"}.`,
    d.message.trim() ? `Message : ${d.message.trim()}.` : "Sans message.",
    `Code ${d.code || "en cours de génération"}, valable jusqu'au ${d.validite}.`,
  ].join(" ");
}

const errorOrder: (keyof GiftInput)[] = ["montant", "soin", "variante", "de", "pour", "message", "emailDestinataire", "dateEnvoi", "emailAcheteur", "telephone", "cgv", "code"];
const errorLabels: Partial<Record<keyof GiftInput, string>> = {
  montant: "le montant",
  soin: "le soin",
  variante: "la formule",
  de: "votre prénom",
  pour: "le prénom du destinataire",
  message: "le message",
  emailDestinataire: "l'e-mail du destinataire",
  dateEnvoi: "la date d'envoi",
  emailAcheteur: "votre e-mail",
  telephone: "votre téléphone",
  cgv: "les conditions de vente",
  code: "le code du bon (rechargez la page)",
};

export function GiftConfigurator() {
  const reduced = useReducedMotion();
  const today = useTodayKey();
  const [categorie, setCategorie] = useState<CategorieId>("visage");
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const {
    register,
    control,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<GiftInput, unknown, GiftValues>({
    resolver: zodResolver(giftSchema),
    defaultValues: giftDefaults,
    mode: "onTouched",
  });

  // Code unique, généré dans le navigateur (crypto.getRandomValues).
  useEffect(() => {
    if (!getValues("code")) setValue("code", genererCode());
  }, [getValues, setValue]);

  const v = useWatch({ control }) as Partial<GiftInput>;
  const type = v.type ?? "montant";
  const remise = v.remise ?? "pdf";
  const soinChoisi = type === "soin" ? getSoin(v.soin ?? "") : undefined;
  const valeur = valeurDuBon({ type, montant: v.montant ?? "", soin: v.soin ?? "", variante: v.variante ?? "" });
  const messageLen = (v.message ?? "").length;

  const data = useMemo(
    () => cardDataFrom({ type, montant: v.montant, soin: v.soin, variante: v.variante, motif: v.motif, de: v.de, pour: v.pour, message: v.message, code: v.code }, today),
    [type, v.montant, v.soin, v.variante, v.motif, v.de, v.pour, v.message, v.code, today],
  );

  const applySoin = useCallback(
    (slug: string) => {
      const s = getSoin(slug);
      if (!s) return;
      setValue("type", "soin");
      setValue("soin", slug);
      setValue("variante", s.variantes?.[0]?.label ?? "");
      setCategorie(s.categorie);
    },
    [setValue],
  );

  useEffect(() => {
    const onOffrir = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (done) {
        // un bon vient d'être validé : on repart d'une carte vierge, avec un nouveau code
        reset({ ...giftDefaults, code: genererCode() });
        setDone(null);
      }
      applySoin(slug);
    };
    window.addEventListener(OFFRIR_EVENT, onOffrir);
    return () => window.removeEventListener(OFFRIR_EVENT, onOffrir);
  }, [applySoin, done, reset]);

  const validate = submitCount > 0;
  const setMontant = (n: number) => setValue("montant", String(n), { shouldValidate: validate, shouldDirty: true });

  const occ = today ? occasionDuMoment(fromKey(today)) : null;
  const jourJ = occ && occ.active && occ.jours <= ENVOI_MAX_JOURS ? toKey(occ.date) : null;

  const complet = {
    a: valeur.prix !== null,
    b: (v.de ?? "").trim().length >= 2 && (v.pour ?? "").trim().length >= 2,
    c:
      emailLike.test(v.emailAcheteur ?? "") &&
      (v.telephone ?? "").replace(/\D/g, "").length >= 9 &&
      !!v.cgv &&
      (remise === "pdf" || (emailLike.test(v.emailDestinataire ?? "") && !!v.dateEnvoi)),
  };

  const errorKeys = errorOrder.filter((k) => errors[k]);

  const onValid = async (values: GiftValues) => {
    setServerError("");
    try {
      const res = await fetch("/api/bon-cadeau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; demo?: boolean; error?: string; scheduledAt?: string | null } | null;
      if (!res.ok || !json?.ok) {
        setServerError(json?.error ?? `L'envoi n'a pas abouti. Réessayez dans un instant ou appelez-nous au ${site.contact.phone}.`);
        return;
      }
      const card = cardDataFrom(values, today);
      let pdfError = false;
      if (values.remise === "pdf") {
        try {
          const { genererPdf } = await import("./pdf");
          await genererPdf(card);
        } catch {
          pdfError = true;
        }
      }
      setDone({ values, card, prix: valeurDuBon(values).prix, demo: !!json.demo, scheduledAt: json.scheduledAt ?? null, pdfError });
      requestAnimationFrame(() => document.getElementById("composer")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }));
    } catch {
      setServerError(`Connexion impossible. Vérifiez votre réseau, ou appelez-nous au ${site.contact.phone}.`);
    }
  };

  const restart = () => {
    reset({ ...giftDefaults, code: genererCode() });
    setDone(null);
    setServerError("");
    requestAnimationFrame(() => document.getElementById("composer")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }));
  };

  const soinsCategorie = soins.filter((s) => s.categorie === categorie);
  const pill =
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-5 font-display text-[0.9rem] transition-[background-color,border-color,color,transform] duration-[var(--dur-2)] ease-[var(--ease-veil)] active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-argile/40";

  return (
    <section
      id="composer"
      aria-labelledby={done ? "bon-succes-titre" : "composer-titre"}
      className="shell relative scroll-mt-4 px-5 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20"
    >
      <Suspense fallback={null}>
        <SoinParam onSoin={applySoin} />
      </Suspense>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="succes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: ease.float }}
          >
            <SuccessPanel done={done} onRestart={restart} />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -12 }} transition={{ duration: 0.45, ease: ease.float }}>
            <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow text-argile-deep">Composer le bon</p>
                <h2 id="composer-titre" className="mt-3 font-display text-display font-light tracking-[-0.045em]">
                  <Compose text="Trois gestes, une carte" />
                </h2>
              </div>
              <p className="max-w-[44ch] text-prune-soft lg:col-span-4 lg:col-start-9">
                Tout se règle sur cette page. L&apos;aperçu suit ce que vous écrivez ; retournez la carte pour relire le verso avant de valider.
              </p>
            </header>

            <form noValidate onSubmit={handleSubmit(onValid)} className="mt-10 grid gap-10 sm:mt-14 lg:grid-cols-12 lg:gap-x-10">
              {/* Aperçu : en tête sur mobile, collant à droite sur grand écran */}
              <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
                <div id="apercu" className="scroll-mt-24 lg:sticky lg:top-28">
                  <ClipReveal from="center">
                    <div className="rounded-[var(--radius-card)] bg-voile px-2 pb-5 pt-2 sm:px-4">
                      <CardPreview data={data} description={describeCard(data)} />
                    </div>
                  </ClipReveal>
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4 px-1">
                    <div>
                      <p className="text-caption text-prune-mute">À régler après validation</p>
                      <p className="font-serif text-[2rem] leading-none tabular" aria-live="polite">
                        {valeur.prix !== null ? formatPrix(valeur.prix) : "—"}
                      </p>
                    </div>
                    <ol aria-label="Avancement" className="flex gap-4">
                      <Drop done={complet.a} label="Choix" />
                      <Drop done={complet.b} label="Mots" />
                      <Drop done={complet.c} label="Remise" />
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-12 lg:col-span-7 lg:row-start-1 lg:space-y-16">
                {/* ————————————————————————— Étape 1 */}
                <Step n={1} id="etape-choix" title="Ce que vous offrez" intro="Une somme, que la personne dépense à sa guise, ou un soin précis choisi dans la carte.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RadioCard value="montant" title="Montant libre" text={`De ${giftMin} à ${giftMax} €, utilisable en une ou plusieurs fois.`} icon="cadeau" {...register("type")} />
                    <RadioCard value="soin" title="Un soin précis" text="Choisi dans la carte, avec sa durée réelle." icon="goutte" {...register("type")} />
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {type === "montant" ? (
                      <motion.div
                        key="montant"
                        className="mt-8"
                        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: ease.veil }}
                      >
                        <p id="montants-titre" className="font-display text-[0.9rem]">
                          Montants souvent choisis
                        </p>
                        <div role="group" aria-labelledby="montants-titre" className="mt-3 flex flex-wrap gap-2">
                          {montantsSuggeres.map((n) => {
                            const on = v.montant === String(n);
                            return (
                              <button
                                key={n}
                                type="button"
                                aria-pressed={on}
                                onClick={() => setMontant(n)}
                                className={cn(pill, "min-w-20 font-serif text-[1.05rem]", on ? "border-prune bg-prune text-lait" : "border-prune/20 bg-ecume hover:border-prune/60")}
                              >
                                {formatPrix(n)}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-6 max-w-xs">
                          <Input
                            label="Montant, en euros"
                            inputMode="numeric"
                            autoComplete="off"
                            hint={`Entre ${giftMin} et ${giftMax} €, sans centimes.`}
                            error={errors.montant?.message}
                            {...register("montant")}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="soin"
                        className="mt-8"
                        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: ease.veil }}
                      >
                        <p id="categories-titre" className="font-display text-[0.9rem]">
                          Famille de soins
                        </p>
                        <div role="group" aria-labelledby="categories-titre" className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
                          {categories.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              aria-pressed={categorie === c.id}
                              onClick={() => setCategorie(c.id)}
                              className={cn(pill, "shrink-0", categorie === c.id ? "border-prune bg-prune text-lait" : "border-prune/20 bg-ecume hover:border-prune/60")}
                            >
                              {c.court}
                            </button>
                          ))}
                        </div>

                        {soinChoisi && soinChoisi.categorie !== categorie ? (
                          <p className="mt-3 text-caption text-prune-mute">
                            Sélection actuelle : <span className="text-prune">{soinChoisi.nom}</span>
                          </p>
                        ) : null}

                        <div role="radiogroup" aria-label={`Soins : ${categories.find((c) => c.id === categorie)?.label}`} aria-describedby="soin-error" className="mt-4 grid gap-1.5">
                          {soinsCategorie.map((s) => (
                            <label
                              key={s.slug}
                              className="group flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-soft)] border border-transparent px-4 py-3 transition-[background-color,border-color] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:bg-sable/50 has-[:checked]:border-prune/70 has-[:checked]:bg-ecume has-[:checked]:shadow-[var(--shadow-veil)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-argile/40"
                            >
                              <input
                                type="radio"
                                value={s.slug}
                                className="sr-only"
                                {...register("soin", {
                                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                                    const x = getSoin(e.target.value);
                                    setValue("variante", x?.variantes?.[0]?.label ?? "");
                                  },
                                })}
                              />
                              <span className="flex min-w-0 items-center gap-3">
                                <span
                                  aria-hidden
                                  className="size-4 shrink-0 rounded-full border border-prune/35 transition-[border-width,border-color] duration-[var(--dur-2)] group-has-[:checked]:border-[5px] group-has-[:checked]:border-prune"
                                />
                                <span className="min-w-0">
                                  <span className="block font-display leading-snug">{s.nom}</span>
                                  <span className="block text-caption text-prune-mute">
                                    {formatDuree(s.duree)}
                                    {s.personnes === 2 ? " · pour deux" : ""}
                                    {s.variantes ? ` · ${s.variantes.length} formules` : ""}
                                  </span>
                                </span>
                              </span>
                              <span className="shrink-0 font-serif text-[1.1rem] tabular">
                                {s.variantes ? <span className="mr-1 font-sans text-caption text-prune-mute">dès</span> : null}
                                {formatPrix(prixDepart(s))}
                              </span>
                            </label>
                          ))}
                        </div>
                        <FieldError id="soin-error" error={errors.soin?.message} />

                        {soinChoisi?.variantes ? (
                          <fieldset className="mt-6">
                            <legend className="font-display text-[0.9rem]">Formule — {soinChoisi.nom}</legend>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {soinChoisi.variantes.map((x) => (
                                <label
                                  key={x.label}
                                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-prune/20 bg-ecume px-4 text-[0.9rem] transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune/60 has-[:checked]:border-prune has-[:checked]:bg-prune has-[:checked]:text-lait has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-argile/40"
                                >
                                  <input type="radio" value={x.label} className="sr-only" {...register("variante")} />
                                  <span className="font-display">{x.label}</span>
                                  <span className="font-serif tabular">{formatPrix(x.prix)}</span>
                                </label>
                              ))}
                            </div>
                            <FieldError id="variante-error" error={errors.variante?.message} />
                          </fieldset>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Step>

                {/* ————————————————————————— Étape 2 */}
                <Step n={2} id="etape-mots" title="Les mots et le motif" intro="Les prénoms et le message sont imprimés au verso. Prenez votre temps : l'aperçu se met à jour à chaque lettre.">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Votre prénom" autoComplete="given-name" maxLength={60} error={errors.de?.message} {...register("de")} />
                    <Input label="Prénom de la personne qui reçoit" autoComplete="off" maxLength={60} error={errors.pour?.message} {...register("pour")} />
                  </div>
                  <div className="mt-5">
                    <Textarea
                      label="Votre message"
                      optional
                      rows={4}
                      maxLength={MESSAGE_MAX}
                      hint="Quelques mots, écrits comme vous les diriez."
                      error={errors.message?.message}
                      {...register("message")}
                    />
                    <p className={cn("mt-1.5 text-right text-caption tabular", MESSAGE_MAX - messageLen <= 20 ? "text-argile-deep" : "text-prune-mute")}>
                      <span aria-hidden>
                        {messageLen} / {MESSAGE_MAX}
                      </span>
                      <span className="sr-only" aria-live="polite">
                        {MESSAGE_MAX - messageLen <= 20 ? `Il reste ${MESSAGE_MAX - messageLen} caractères.` : ""}
                      </span>
                    </p>
                  </div>

                  <fieldset className="mt-8">
                    <legend className="font-display text-[0.9rem]">Motif de la carte</legend>
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:gap-4">
                      {motifs.map((m) => (
                        <label key={m.id} className="group cursor-pointer">
                          <input type="radio" value={m.id} className="peer sr-only" {...register("motif")} />
                          <span className="block overflow-hidden rounded-[10px] shadow-[var(--shadow-veil)] ring-offset-4 ring-offset-ecume transition-[transform,box-shadow] duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:-translate-y-1 peer-checked:ring-2 peer-checked:ring-prune peer-focus-visible:ring-4 peer-focus-visible:ring-argile/60 sm:rounded-[14px]">
                            <span className="block aspect-[1.6]">
                              <MotifMini id={m.id} />
                            </span>
                          </span>
                          <span className="mt-3 flex items-center gap-1.5 font-display text-[0.95rem]">
                            <Icon name="check" size={14} strokeWidth={1.8} className="hidden text-prune group-has-[:checked]:inline" />
                            {m.label}
                          </span>
                          <span className="hidden text-caption text-prune-mute sm:block">{m.description}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <a
                    href="#apercu"
                    className="mt-6 inline-flex min-h-11 items-center gap-2 font-display text-[0.9rem] underline decoration-prune/30 underline-offset-[6px] hover:decoration-prune lg:hidden"
                  >
                    <Icon name="fleche-bas" size={16} className="rotate-180" />
                    Revoir l&apos;aperçu de la carte
                  </a>
                </Step>

                {/* ————————————————————————— Étape 3 */}
                <Step n={3} id="etape-remise" title="La remise">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RadioCard value="pdf" title="L'imprimer maintenant" text="PDF 21 × 9,9 cm, téléchargé dès la validation." icon="imprimer" {...register("remise")} />
                    <RadioCard value="email" title="L'envoyer par e-mail" text="À la date choisie, à 9 h (heure de Paris)." icon="enveloppe" {...register("remise")} />
                  </div>

                  <AnimatePresence initial={false}>
                    {remise === "email" ? (
                      <motion.div
                        key="email"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0.2 : 0.55, ease: ease.veil }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-5 px-1 pb-1 pt-6 sm:grid-cols-2">
                          <Input
                            label="E-mail de la personne qui reçoit"
                            type="email"
                            autoComplete="off"
                            error={errors.emailDestinataire?.message}
                            {...register("emailDestinataire")}
                          />
                          <div>
                            <Input
                              label="Date d'envoi"
                              type="date"
                              min={today ?? undefined}
                              max={today ? addDaysKey(today, ENVOI_MAX_JOURS) : undefined}
                              hint={`À 9 h, jusqu'à ${ENVOI_MAX_JOURS} jours à l'avance.`}
                              error={errors.dateEnvoi?.message}
                              {...register("dateEnvoi")}
                            />
                            {jourJ && occ ? (
                              <button
                                type="button"
                                onClick={() => setValue("dateEnvoi", jourJ, { shouldValidate: validate })}
                                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-argile-pale px-4 text-[0.875rem] transition-colors hover:bg-sable"
                              >
                                <Icon name="calendrier" size={16} />
                                Le jour J : {formatDateLong(jourJ, { year: false })}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="mt-10">
                    <p className="font-display text-[1.05rem]">Vos coordonnées</p>
                    <p className="mt-1 max-w-[52ch] text-[0.9rem] text-prune-soft">Pour la confirmation, et pour convenir du règlement avec vous. Elles ne servent à rien d&apos;autre.</p>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <Input label="Votre e-mail" type="email" autoComplete="email" error={errors.emailAcheteur?.message} {...register("emailAcheteur")} />
                      <Input label="Votre téléphone" type="tel" autoComplete="tel" inputMode="tel" error={errors.telephone?.message} {...register("telephone")} />
                    </div>
                  </div>

                  <input type="hidden" {...register("code")} />
                  {/* Champ piège : invisible pour les humains */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Ne pas remplir
                      <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
                    </label>
                  </div>

                  <div className="mt-8 flex gap-4 rounded-[var(--radius-card)] bg-sauge-pale p-5 sm:p-6">
                    <Icon name="main" size={22} className="mt-0.5 shrink-0 text-sauge-deep" />
                    <div className="text-[0.95rem]">
                      <p className="font-display">Aucun paiement en ligne.</p>
                      <p className="mt-1 text-prune-soft">
                        Le code est réservé à votre nom dès la validation. Le bon est activé après règlement : nous vous appelons {site.contact.responseTime}, ou vous
                        le réglez directement à l&apos;institut ({site.address.street}, {site.address.city}).
                      </p>
                    </div>
                  </div>

                  <Checkbox
                    className="mt-6"
                    error={errors.cgv?.message}
                    label={
                      <>
                        J&apos;ai lu et j&apos;accepte les{" "}
                        <Link href="/cgv-bons-cadeaux" target="_blank" className="underline decoration-prune/40 underline-offset-4 hover:decoration-prune">
                          conditions générales de vente des bons cadeaux
                          <span className="sr-only"> (nouvel onglet)</span>
                        </Link>
                        .
                      </>
                    }
                    {...register("cgv")}
                  />
                </Step>

                {/* ————————————————————————— Validation */}
                <div className="rounded-[var(--radius-card)] bg-sable/70 p-5 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-caption text-prune-mute">{valeur.soin ? valeur.titre : "Bon cadeau, montant libre"}</p>
                      <p className="mt-1 font-serif text-title leading-none tabular">{valeur.prix !== null ? formatPrix(valeur.prix) : "—"}</p>
                    </div>
                    <Button type="submit" size="lg" icon={isSubmitting ? undefined : "fleche"} disabled={isSubmitting} aria-busy={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting ? "Un instant…" : remise === "pdf" ? "Valider et télécharger" : "Valider et programmer"}
                    </Button>
                  </div>

                  {validate && errorKeys.length ? (
                    <div role="alert" className="mt-5 border-t border-prune/10 pt-4 text-[0.9rem] text-[#8f2f2f]">
                      {errorKeys.length === 1 ? "Il reste une information à vérifier : " : `Il reste ${errorKeys.length} informations à vérifier : `}
                      {errorKeys.map((k, i) => (
                        <span key={k}>
                          {i ? ", " : ""}
                          {errorLabels[k]}
                        </span>
                      ))}
                      .
                    </div>
                  ) : null}

                  {serverError ? (
                    <div role="alert" className="mt-5 flex gap-3 border-t border-prune/10 pt-4 text-[0.95rem] text-[#8f2f2f]">
                      <Icon name="goutte" size={20} className="mt-0.5 shrink-0" />
                      <p>
                        {serverError}{" "}
                        <a href={site.contact.phoneHref} className="whitespace-nowrap underline underline-offset-4">
                          Appeler l&apos;institut
                        </a>
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
