"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ease } from "@/lib/motion";

const KEY = "brume-consent";
const EVENT = "brume:cookies";

export type Consent = { audience: boolean; date: string };

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

/**
 * Bannière cookies sobre et conforme CNIL : refuser est aussi simple
 * qu'accepter (même taille, même niveau). Aucun traceur n'est déposé
 * avant consentement — le site n'en utilise d'ailleurs aucun par défaut.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(readConsent() === null), 1600);
    const reopen = () => setOpen(true);
    window.addEventListener(EVENT, reopen);
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENT, reopen);
    };
  }, []);

  const save = (audience: boolean) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ audience, date: new Date().toISOString() } satisfies Consent));
    } catch {
      /* stockage indisponible : on ferme simplement */
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          role="region"
          aria-label="Cookies"
          className="fixed bottom-24 left-3 right-3 z-[45] max-w-[420px] rounded-[var(--radius-card)] bg-ecume p-5 shadow-[var(--shadow-float)] md:bottom-5 md:left-5 md:right-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: ease.veil }}
        >
          <h2 className="font-display text-[1.05rem]">Une question de cookies</h2>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-prune-soft">
            Nous n&apos;utilisons aucun cookie publicitaire. Avec votre accord, une mesure d&apos;audience anonyme nous aiderait à savoir quels soins vous
            intéressent. <Link href="/confidentialite" className="underline underline-offset-4">En savoir plus</Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => save(false)} className="min-h-11 rounded-full border border-prune/40 font-display text-[0.9rem] hover:border-prune">
              Refuser
            </button>
            <button type="button" onClick={() => save(true)} className="min-h-11 rounded-full border border-prune/40 font-display text-[0.9rem] hover:border-prune">
              Accepter
            </button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(EVENT))}>
      Gérer les cookies
    </button>
  );
}
