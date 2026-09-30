/**
 * BRUME — photothèque.
 * Chaque photo a un point focal (en %) : c'est lui qui reste au centre du
 * cadre quel que soit le format (pastille, carré, portrait, bandeau).
 * Source : photo Pexels fournie par le client (voir ASSETS.md).
 */
export const photos = {
  visage: { src: "/images/brume/visage.jpg", w: 1197, h: 2000, focal: "50% 47%", alt: "Portrait d'une femme au teint lumineux après un soin visage" },
  visageSerre: { src: "/images/brume/visage-serre.jpg", w: 700, h: 900, focal: "50% 42%", alt: "Visage au teint frais et hydraté" },
  regard: { src: "/images/brume/regard.jpg", w: 1197, h: 450, focal: "50% 50%", alt: "Regard et peau nette autour des yeux" },
  levres: { src: "/images/brume/levres.jpg", w: 800, h: 400, focal: "50% 52%", alt: "Lèvres hydratées" },
  peau: { src: "/images/brume/peau.jpg", w: 637, h: 860, focal: "35% 45%", alt: "Pommette et grain de peau lumineux" },
  epaules: { src: "/images/brume/epaules.jpg", w: 1197, h: 900, focal: "50% 28%", alt: "Cou et épaules détendus après un modelage" },
  nude: { src: "/images/brume/nude.jpg", w: 1197, h: 320, focal: "50% 50%", alt: "" },
} as const;

export type PhotoId = keyof typeof photos;
