"use client";

import { motion } from "motion/react";
import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import type { MotifId } from "@/data/bons-cadeaux";
import { useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

/** Étape du configurateur : fieldset + légende numérotée (le chiffre monte sous masque). */
export function Step({ n, title, intro, children, id }: { n: number; title: string; intro?: string; children: ReactNode; id: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.fieldset
      id={id}
      className="min-w-0 scroll-mt-28 border-t hairline pt-8 sm:pt-10"
      initial={{ opacity: 0, y: reduced ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: ease.veil }}
    >
      <legend className="float-left flex w-full items-baseline gap-4 sm:gap-6">
        <span aria-hidden className="inline-block overflow-hidden pb-1">
          <motion.span
            className="inline-block font-serif text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] leading-none text-argile-deep tabular"
            initial={reduced ? { opacity: 0 } : { y: "105%" }}
            whileInView={reduced ? { opacity: 1 } : { y: "0%" }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1, ease: ease.veil, delay: 0.1 }}
          >
            {String(n).padStart(2, "0")}
          </motion.span>
        </span>
        <span className="font-display text-title font-light tracking-[-0.03em]">
          <span className="sr-only">Étape {n} : </span>
          {title}
        </span>
      </legend>
      <div className="clear-left pt-5 sm:pt-7">
        {intro ? <p className="mb-6 max-w-[52ch] text-prune-soft">{intro}</p> : null}
        {children}
      </div>
    </motion.fieldset>
  );
}

type RadioCardProps = Omit<ComponentProps<"input">, "type" | "title"> & { title: string; text: string; icon: IconName };

/** Grande option (radio natif, compatible `register`). */
export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(function RadioCard({ title, text, icon, className, ...rest }, ref) {
  return (
    <label
      className={cn(
        "group relative flex min-h-24 cursor-pointer items-start gap-4 rounded-[var(--radius-card)] border border-prune/15 bg-ecume p-5 pr-12 transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune/45 active:scale-[0.99] has-[:checked]:border-prune has-[:checked]:bg-prune has-[:checked]:text-lait has-[:checked]:shadow-[var(--shadow-veil)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-argile/40",
        className,
      )}
    >
      <input ref={ref} type="radio" className="sr-only" {...rest} />
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sable text-prune transition-colors duration-[var(--dur-2)] group-has-[:checked]:bg-lait/12 group-has-[:checked]:text-lait">
        <Icon name={icon} size={22} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[1.05rem] leading-snug">{title}</span>
        <span className="mt-1 block text-[0.9rem] leading-snug text-prune-soft transition-colors group-has-[:checked]:text-lait/80">{text}</span>
      </span>
      <span
        aria-hidden
        className="absolute right-4 top-4 grid size-6 place-items-center rounded-full border border-prune/25 text-transparent transition-[background-color,border-color,color] duration-[var(--dur-2)] group-has-[:checked]:border-lait group-has-[:checked]:bg-lait group-has-[:checked]:text-prune"
      >
        <Icon name="check" size={14} strokeWidth={1.8} />
      </span>
    </label>
  );
});

/** Vignette vectorielle d'un motif (sélecteur). */
export function MotifMini({ id, className }: { id: MotifId; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 160 100" className={cn("block size-full", className)} aria-hidden>
      {id === "galets" ? (
        <>
          <defs>
            {[
              ["a", "#FFFDFA", "#D9CBBB", "#A89786"],
              ["b", "#F1F4EF", "#B8C6B5", "#7F917C"],
              ["c", "#7A6570", "#3B2A33", "#23191F"],
            ].map(([k, c0, c1, c2]) => (
              <radialGradient key={k} id={`${uid}${k}`} cx="0.35" cy="0.3" r="0.9">
                <stop offset="0" stopColor={c0} />
                <stop offset="0.55" stopColor={c1} />
                <stop offset="1" stopColor={c2} />
              </radialGradient>
            ))}
          </defs>
          <rect width="160" height="100" fill="#E8DDD0" />
          <ellipse cx="118" cy="86" rx="30" ry="4" fill="#3B2A33" opacity="0.15" />
          <ellipse cx="118" cy="78" rx="28" ry="9.5" fill={`url(#${uid}a)`} />
          <ellipse cx="116" cy="62" rx="21" ry="7.5" fill={`url(#${uid}b)`} />
          <ellipse cx="119" cy="49" rx="14" ry="5.4" fill={`url(#${uid}c)`} />
          <text x="12" y="88" fontSize="22" fontWeight="300" fill="#3B2A33" style={{ fontFamily: "var(--font-manrope)" }} letterSpacing="-1">
            BRUME
          </text>
        </>
      ) : id === "brume" ? (
        <>
          <rect width="160" height="100" fill="#9CAF9A" />
          {[5, 11, 19, 28, 39, 52, 66].map((r, i) => (
            <ellipse key={r} cx="112" cy="64" rx={r} ry={r * 0.34} fill="none" stroke="#FAF6F1" strokeOpacity={Math.max(0.15, 0.9 - i * 0.12)} strokeWidth="0.9" />
          ))}
          <path d="M112 38c2.6 3.4 4.4 6 4.4 8.2a4.4 4.4 0 1 1-8.8 0c0-2.2 1.8-4.8 4.4-8.2Z" fill="#FAF6F1" />
          <text x="12" y="88" fontSize="22" fontWeight="300" fill="#23191F" style={{ fontFamily: "var(--font-manrope)" }} letterSpacing="-1">
            BRUME
          </text>
        </>
      ) : (
        <>
          <rect width="160" height="100" fill="#3B2A33" />
          <path d="M104 62c10-14 38-12 48 2s0 34-18 36-40-4-38-16 0-14 8-22Z" fill="#8B5E45" />
          <path d="M98 60c8-12 32-12 40 0s2 26-14 28-34-2-32-12 0-10 6-16Z" fill="#C9A48A" />
          <path d="M132 18c6-4 16-2 18 4s-4 12-12 12-12-4-10-8 0-6 4-8Z" fill="#EFE2D8" opacity="0.8" />
          <text x="12" y="88" fontSize="22" fontWeight="300" fill="#FAF6F1" style={{ fontFamily: "var(--font-manrope)" }} letterSpacing="-1">
            BRUME
          </text>
        </>
      )}
    </svg>
  );
}

/** Petite goutte d'avancement (remplie quand l'étape est complète). */
export function Drop({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <path
          d="M12 3.2c3.3 4.2 5.6 7.7 5.6 10.6a5.6 5.6 0 1 1-11.2 0c0-2.9 2.3-6.4 5.6-10.6Z"
          className={cn("transition-[fill,stroke] duration-[var(--dur-3)] ease-[var(--ease-veil)]", done ? "fill-prune stroke-prune" : "fill-transparent stroke-prune/35")}
          strokeWidth="1.25"
        />
      </svg>
      <span className={cn("text-caption transition-colors", done ? "text-prune" : "text-prune-mute")}>
        {label}
        <span className="sr-only">{done ? " : complet" : " : à compléter"}</span>
      </span>
    </li>
  );
}
