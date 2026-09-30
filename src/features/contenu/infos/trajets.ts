import { fullAddress } from "@/config/site";

/**
 * Temps de trajet indicatifs en voiture jusqu'à l'institut, hors
 * embouteillages d'été. Coordonnées dans le repère de la carte
 * (viewBox 800 × 640, projection simple du Bassin de Thau).
 */
export interface Trajet {
  ville: string;
  minutes: number;
  via?: string;
  /** Position sur la carte. */
  x?: number;
  y?: number;
  /** Tracé stylisé vers l'institut. */
  route?: string;
  /** Position de l'étiquette de durée. */
  label?: { x: number; y: number };
}

export const INSTITUT = { x: 492, y: 238 };

export const trajets: Trajet[] = [
  { ville: "Balaruc-le-Vieux", minutes: 5, x: 522, y: 140 },
  { ville: "Bouzigues", minutes: 8, x: 426, y: 198 },
  { ville: "Poussan", minutes: 10, x: 462, y: 72 },
  {
    ville: "Sète",
    minutes: 12,
    via: "par la D2",
    x: 562,
    y: 372,
    route: "M562 372C606 344 612 292 590 262S522 246 492 238",
    label: { x: 612, y: 318 },
  },
  {
    ville: "Frontignan",
    minutes: 15,
    x: 704,
    y: 214,
    route: "M704 214C664 196 614 204 574 220S514 240 492 238",
    label: { x: 640, y: 186 },
  },
  {
    ville: "Mèze",
    minutes: 18,
    x: 288,
    y: 270,
    route: "M288 270C320 196 404 160 452 176S486 214 492 238",
    label: { x: 356, y: 172 },
  },
  { ville: "Montpellier", minutes: 30, via: "par l'A9, sortie Sète" },
];

export const itineraireDepuis = (ville: string) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${ville}, France`)}&destination=${encodeURIComponent(fullAddress)}&travelmode=driving`;
