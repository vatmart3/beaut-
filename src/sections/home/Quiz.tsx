"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { questions, recommander, type ReponsesQuiz } from "@/data/quiz";
import { formatDuree, formatPrix, prixDepart, getCategorie, type Soin } from "@/data/soins";
import { Icon, type IconName } from "@/components/icons/Icon";
import { Compose } from "@/components/effects/LineReveal";
import { Matiere } from "@/components/ui/Matiere";
import { Button } from "@/components/ui/Button";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

type Key = "besoin" | "temps" | "zone" | "budget";

/** Progression en gouttes : chaque goutte se remplit quand une question est répondue. */
function DropProgress({ step, total }: { step: number; total: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className="flex items-end gap-2.5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step} aria-label={`Question ${Math.min(step + 1, total)} sur ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < step;
        const current = i === step;
        return (
          <svg key={i} viewBox="0 0 24 32" className={cn("h-8 w-6 transition-transform duration-500 ease-[var(--ease-veil)]", current && "-translate-y-1")} aria-hidden>
            <defs>
              <clipPath id={`d${id}${i}`}>
                <path d="M12 1.5c5 6.3 9.5 12 9.5 17.5a9.5 9.5 0 1 1-19 0C2.5 13.5 7 7.8 12 1.5Z" />
              </clipPath>
            </defs>
            <g clipPath={`url(#d${id}${i})`}>
              <rect width="24" height="32" fill="#FFFFFF" />
              <motion.rect
                x="0"
                width="24"
                height="32"
                fill="#221B1D"
                initial={false}
                animate={{ y: filled ? 0 : current ? 22 : 32 }}
                transition={{ duration: 0.9, ease: ease.veil }}
              />
            </g>
            <path d="M12 1.5c5 6.3 9.5 12 9.5 17.5a9.5 9.5 0 1 1-19 0C2.5 13.5 7 7.8 12 1.5Z" fill="none" stroke="#221B1D" strokeOpacity="0.45" strokeWidth="1" />
          </svg>
        );
      })}
    </div>
  );
}

const galetShapes = [
  "58% 42% 55% 45% / 52% 58% 42% 48%",
  "46% 54% 42% 58% / 55% 45% 55% 45%",
  "52% 48% 60% 40% / 45% 55% 45% 55%",
  "60% 40% 48% 52% / 50% 50% 50% 50%",
];

export function Quiz() {
  const [step, setStep] = useState(0);
  const [rep, setRep] = useState<ReponsesQuiz>({});
  const reduced = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const total = questions.length;
  const done = step >= total;
  const result = done ? recommander(rep as Required<ReponsesQuiz>) : null;

  const choose = (key: Key, value: string | number) => {
    setRep((r) => ({ ...r, [key]: value }));
    setTimeout(() => {
      setStep((s) => s + 1);
      requestAnimationFrame(() => headingRef.current?.focus());
    }, reduced ? 0 : 260);
  };

  const restart = () => {
    setRep({});
    setStep(0);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const q = questions[Math.min(step, total - 1)];

  return (
    <section id="rituel" aria-labelledby="quiz-title" className="shell relative scroll-mt-24 overflow-hidden bg-sable px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="eyebrow text-argile-deep">Micro-diagnostic · 40 secondes</p>
          <h2 id="quiz-title" className="mt-5 font-display text-[clamp(2.25rem,1.2rem+3.4vw,4.75rem)] font-light leading-[0.98] tracking-[-0.045em]">
            <Compose text="Votre rituel" />
            <br />
            <span className="text-prune-soft">
              <Compose text="en 4 questions" delay={0.3} />
            </span>
          </h2>
          <p className="mt-6 max-w-[34ch] text-prune-soft">
            Quatre choix, sans e-mail à laisser. Vous obtenez un soin recommandé, une alternative, et un lien pour réserver directement le bon créneau.
          </p>
          <div className="mt-10 flex items-center gap-5">
            <DropProgress step={step} total={total} />
            <p className="tabular text-[0.9rem] text-prune-soft" aria-live="polite">
              {done ? "Votre rituel est prêt" : `${step + 1} / ${total}`}
            </p>
          </div>
        </div>

        <div className="min-h-[460px] lg:col-span-7 lg:col-start-6">
          <AnimatePresence mode="wait" initial={false}>
            {!done ? (
              <motion.fieldset
                key={q.id}
                initial={{ opacity: 0, y: reduced ? 0 : 30, filter: reduced ? "none" : "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: reduced ? 0 : -24, filter: reduced ? "none" : "blur(8px)" }}
                transition={{ duration: 0.55, ease: ease.veil }}
              >
                <legend className="w-full">
                  <h3 ref={headingRef} tabIndex={-1} className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.4rem)] font-light leading-tight tracking-[-0.03em] outline-none">
                    {q.titre}
                  </h3>
                </legend>
                <div className={cn("mt-8 grid gap-3 sm:gap-4", q.options.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
                  {q.options.map((o, i) => {
                    const selected = rep[q.id as Key] === o.value;
                    return (
                      <button
                        key={String(o.value)}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => choose(q.id as Key, o.value)}
                        style={{ borderRadius: galetShapes[i % 4] }}
                        className={cn(
                          "group relative flex min-h-[112px] items-center gap-4 px-6 py-5 text-left shadow-[var(--shadow-galet)] transition-[transform,background-color,color] duration-[var(--dur-3)] ease-[var(--ease-veil)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] sm:min-h-[150px] sm:flex-col sm:items-start sm:justify-between",
                          selected ? "bg-prune text-lait" : "bg-[radial-gradient(120%_100%_at_30%_15%,#FFFFFF,#f1ebe3_65%,#e6dccf)] text-prune",
                        )}
                      >
                        <Icon name={o.icone as IconName} size={34} strokeWidth={1.1} className="shrink-0 transition-transform duration-500 ease-[var(--ease-veil)] group-hover:-rotate-6 group-hover:scale-110" />
                        <span>
                          <span className="block font-display text-[1.15rem] leading-tight tracking-[-0.02em]">{o.label}</span>
                          <span className={cn("mt-1 block text-[0.85rem]", selected ? "text-lait/75" : "text-prune-soft")}>{o.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-display text-[0.9rem] text-prune-soft hover:text-prune"
                  >
                    <Icon name="retour" size={16} />
                    Question précédente
                  </button>
                ) : null}
              </motion.fieldset>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: reduced ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: ease.veil }}
              >
                <h3 ref={headingRef} tabIndex={-1} className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.4rem)] font-light leading-tight tracking-[-0.03em] outline-none">
                  Voici ce que nous vous proposerions en cabine.
                </h3>
                <div className="mt-8 grid gap-4 md:grid-cols-[1.35fr_1fr]">
                  <ResultCard soin={result.principal} main />
                  <ResultCard soin={result.alternative} />
                </div>
                <button
                  type="button"
                  onClick={restart}
                  className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-display text-[0.9rem] text-prune-soft hover:text-prune"
                >
                  <Icon name="retourner" size={16} />
                  Recommencer le questionnaire
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ soin, main = false }: { soin: Soin; main?: boolean }) {
  return (
    <article className={cn("flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-ecume shadow-[var(--shadow-veil)]", main && "md:row-span-2")}>
      <Matiere kind={soin.matiere} className={cn("w-full", main ? "aspect-[16/10]" : "aspect-[16/8]")} sizes="(min-width: 768px) 30vw, 90vw" />
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow text-argile-deep">{main ? "Recommandé pour vous" : "Ou bien"} · {getCategorie(soin.categorie).court}</p>
        <h4 className="mt-3 font-display text-[1.6rem] font-light leading-tight tracking-[-0.03em]">{soin.nom}</h4>
        <p className="mt-2 text-[0.95rem] text-prune-soft">{soin.accroche}</p>
        {main ? <p className="mt-3 text-[0.95rem] leading-relaxed">{soin.description}</p> : null}
        <p className="mt-4 flex items-baseline gap-3">
          <span className="font-serif text-[1.6rem]">{formatPrix(prixDepart(soin))}</span>
          <span className="text-[0.9rem] text-prune-mute">{formatDuree(soin.duree)}</span>
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Button href={`/reserver?soin=${soin.slug}`} size="sm" variant={main ? "solid" : "outline"} icon="fleche">
            Réserver ce soin
          </Button>
          <Link href={`/soins/${soin.slug}`} className="inline-flex min-h-11 items-center px-3 font-display text-[0.875rem] underline decoration-prune/30 underline-offset-4 hover:decoration-prune">
            Voir le déroulé
          </Link>
        </div>
      </div>
    </article>
  );
}
