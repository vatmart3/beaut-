"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** `prefers-reduced-motion`, réactif. `false` côté serveur. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Appareil jugé trop faible pour la 3D (cœurs / mémoire). */
export function isLowEnd() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  return cores <= 4 || mem <= 4;
}

/**
 * Décide si la scène 3D peut tourner. `null` tant que non déterminé (SSR,
 * premier rendu) → on affiche le fallback statique, qui est aussi le visuel LCP.
 */
export function use3DCapable() {
  const reduced = useReducedMotion();
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOk(!reduced && hasWebGL() && !isLowEnd()));
    return () => cancelAnimationFrame(id);
  }, [reduced]);
  return ok;
}

/** Vrai sur écrans tactiles sans survol. */
export function useCoarsePointer() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(hover: none) and (pointer: coarse)").matches,
    () => false,
  );
}
