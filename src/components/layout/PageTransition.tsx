"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";

let hasMounted = false;

/**
 * Transition entre pages : un voile couleur lait, au bord inférieur courbe
 * comme une vague, se retire vers le haut ; le contenu apparaît dessous.
 * Ignorée au premier chargement (le loader s'en charge).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasMounted);
  const reduced = useReducedMotion();
  useEffect(() => {
    hasMounted = true;
  }, []);

  if (!animate) return <>{children}</>;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.3 : 0.9, delay: reduced ? 0 : 0.25, ease: ease.veil }}
      >
        {children}
      </motion.div>
      {reduced ? null : (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[115vh]"
          initial={{ y: "0%" }}
          animate={{ y: "-110%" }}
          transition={{ duration: 1, ease: ease.tide }}
        >
          <div className="h-[100vh] bg-sable" />
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="block h-[15vh] w-full fill-sable">
            <path d="M0 0h100v2C80 10 60 10 50 6S20 0 0 8Z" />
          </svg>
        </motion.div>
      )}
    </>
  );
}
