"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Heure réelle du navigateur, arrondie à la minute et rafraîchie toutes les
 * 30 s. `null` côté serveur et pendant l'hydratation : les calculs de
 * disponibilité et d'ouverture ne se font donc jamais sur l'heure du serveur.
 */
let snapshot: number | null = null;
const read = () => Math.floor(Date.now() / 60000) * 60000;

function subscribe(cb: () => void) {
  const id = window.setInterval(() => {
    const next = read();
    if (next !== snapshot) {
      snapshot = next;
      cb();
    }
  }, 30000);
  return () => window.clearInterval(id);
}

function getSnapshot() {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

export function useNow(): Date | null {
  const ts = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return useMemo(() => (ts === null ? null : new Date(ts)), [ts]);
}
