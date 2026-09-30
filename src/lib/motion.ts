/**
 * Easings et durées partagés JS ↔ CSS (voir globals.css).
 * Ne jamais utiliser les easings par défaut : toujours ces courbes.
 */
export const ease = {
  veil: [0.22, 1, 0.36, 1] as const,
  tide: [0.7, 0, 0.2, 1] as const,
  fall: [0.55, 0, 1, 0.45] as const,
  float: [0.33, 1, 0.68, 1] as const,
};

/** Versions texte pour GSAP (CustomEase non requis). */
export const gsapEase = {
  veil: "expo.out",
  tide: "power3.inOut",
  fall: "power2.in",
  float: "sine.out",
};

export const dur = { 1: 0.2, 2: 0.35, 3: 0.5, 4: 0.7, long: 1.2 } as const;
