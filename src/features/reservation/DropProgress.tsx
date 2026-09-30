"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";

const DROP = "M16 2.5C22 11 27.5 18 27.5 26a11.5 11.5 0 1 1-23 0C4.5 18 10 11 16 2.5Z";

/**
 * Progression en gouttes : chaque étape est une goutte qui se remplit.
 * Étape faite = pleine (cliquable pour y revenir), étape en cours = à moitié,
 * avec une surface qui ondule, étape à venir = contour.
 */
export function DropProgress({
  steps,
  current,
  reachable,
  onGo,
}: {
  steps: string[];
  current: number;
  /** Plus haute étape atteignable. */
  reachable: number;
  onGo: (i: number) => void;
}) {
  return (
    <nav aria-label="Étapes de la réservation">
      <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {/* Filet d'eau qui relie les gouttes */}
        <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[22px] h-px bg-prune/15">
          <motion.span
            className="absolute inset-y-0 left-0 w-full origin-left bg-argile-deep"
            initial={false}
            animate={{ scaleX: current / (steps.length - 1) }}
            transition={{ duration: 0.9, ease: ease.tide }}
          />
        </span>
        {steps.map((label, i) => {
          const state = i < current ? "done" : i === current ? "current" : "todo";
          const clickable = i !== current && i <= reachable;
          const content = (
            <>
              <Drop level={state === "done" ? 1 : state === "current" ? 0.5 : i <= reachable ? 0.15 : 0} active={state === "current"} />
              <span className="mt-2 flex flex-col items-center leading-tight">
                <span className="tabular font-serif text-[0.8rem] text-prune-mute">{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("font-display text-[0.8125rem] sm:text-[0.9rem]", state === "todo" ? "text-prune-mute" : "text-prune")}>{label}</span>
              </span>
            </>
          );
          return (
            <li key={label} className="relative flex justify-center">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onGo(i)}
                  className="group flex min-h-11 flex-col items-center rounded-[var(--radius-soft)] px-1 pb-1 transition-transform duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:-translate-y-0.5"
                  aria-label={`Revenir à l'étape ${i + 1} : ${label}`}
                >
                  {content}
                </button>
              ) : (
                <span className="flex flex-col items-center px-1 pb-1" aria-current={state === "current" ? "step" : undefined}>
                  {content}
                  <span className="sr-only">{state === "current" ? " (étape en cours)" : " (à venir)"}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Drop({ level, active }: { level: number; active: boolean }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  return (
    <span className="relative grid size-11 place-items-center rounded-full bg-ecume">
      <svg width="30" height="37" viewBox="0 0 32 40" aria-hidden className="overflow-visible">
        <defs>
          <clipPath id={`d${id}`}>
            <path d={DROP} />
          </clipPath>
        </defs>
        <g clipPath={`url(#d${id})`}>
          <motion.g initial={false} animate={{ y: 40 - level * 38 }} transition={{ duration: 1, ease: ease.veil }}>
            <motion.path
              d="M-32 3c4-2.5 8-2.5 12 0s8 2.5 12 0 8-2.5 12 0 8 2.5 12 0 8-2.5 12 0 8 2.5 12 0 8-2.5 12 0V60H-32Z"
              className={level >= 1 ? "fill-argile-deep" : "fill-argile"}
              animate={active && !reduced ? { x: [0, 24] } : { x: 0 }}
              transition={active && !reduced ? { duration: 2.6, repeat: Infinity, ease: "linear" } : { duration: 0.3, ease: ease.veil }}
            />
          </motion.g>
        </g>
        <path d={DROP} fill="none" stroke="currentColor" strokeWidth="1.25" className={cn(level > 0 ? "text-prune" : "text-prune/35")} />
        {level >= 1 ? <path d="M11.2 26.6c1.5 1 2.6 2.1 3.4 3.6 1.9-3.8 4.4-6.5 7.8-8.5" fill="none" stroke="#FFFDFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
    </span>
  );
}
