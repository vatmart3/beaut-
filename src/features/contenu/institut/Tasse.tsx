"use client";

import { motion } from "motion/react";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";

/** Une tasse, et la vapeur qui monte en boucle lente. */
export function Tasse({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const vapeurs = ["M52 58c-8-9 8-15 0-25s8-16 0-24", "M66 60c-8-9 8-15 0-25s8-16 0-26", "M80 58c-8-9 8-15 0-25s8-16 0-24"];
  return (
    <svg viewBox="0 0 132 150" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {vapeurs.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          strokeOpacity="0.55"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={reduced ? { pathLength: 1, opacity: 0.6 } : { pathLength: [0, 1, 1], opacity: [0, 0.8, 0], y: [8, 0, -10] }}
          transition={reduced ? { duration: 0.4 } : { duration: 3.6, delay: i * 0.9, repeat: Infinity, ease: ease.float, times: [0, 0.55, 1] }}
        />
      ))}
      <path d="M28 76h76v14c0 22-17 38-38 38S28 112 28 90V76Z" className="fill-ecume" />
      <path d="M104 84h6a12 12 0 0 1 0 24h-8" />
      <path d="M16 136c20 6 80 6 100 0" strokeOpacity="0.5" />
      <path d="M36 84c10 3 50 3 60 0" strokeOpacity="0.35" />
    </svg>
  );
}
