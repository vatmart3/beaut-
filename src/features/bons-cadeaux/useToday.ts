"use client";

import { useSyncExternalStore } from "react";
import { parisTodayKey } from "./model";

const subscribe = () => () => {};

/**
 * Date du jour (Paris, AAAA-MM-JJ), lue uniquement côté client pour être
 * juste au moment de la visite. `null` pendant le rendu serveur.
 */
export function useTodayKey() {
  return useSyncExternalStore(subscribe, () => parisTodayKey(), () => null);
}
