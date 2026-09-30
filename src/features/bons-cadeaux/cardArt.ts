/**
 * Dessin 2D (canvas) du recto et du verso de la carte cadeau.
 * Utilisé comme texture par la scène 3D et directement par le fallback CSS.
 * Toutes les dimensions sont exprimées pour un canvas de CARD_W × CARD_H,
 * puis mises à l'échelle.
 */
import { site } from "@/config/site";
import type { MotifId } from "@/data/bons-cadeaux";
import { motifDe } from "./model";

export const CARD_W = 1600;
export const CARD_H = 1000;
export const CARD_RATIO = CARD_W / CARD_H;

export interface CardData {
  motif: MotifId;
  titre: string;
  detail: string;
  estSoin: boolean;
  de: string;
  pour: string;
  message: string;
  code: string;
  validite: string;
}

export interface CardFonts {
  display: string;
  serif: string;
  sans: string;
}

type Ctx = CanvasRenderingContext2D;

/* ——————————————————————————————————————————————— Polices */

export function cardFonts(): CardFonts {
  const cs = getComputedStyle(document.documentElement);
  const read = (v: string, fb: string) => cs.getPropertyValue(v).trim() || fb;
  return {
    display: read("--font-manrope", "ui-sans-serif, system-ui, sans-serif"),
    serif: read("--font-gloock", "Georgia, serif"),
    sans: read("--font-hanken", "ui-sans-serif, system-ui, sans-serif"),
  };
}

let fontsPromise: Promise<void> | null = null;

/** Attend que les graisses utilisées sur la carte soient chargées (une seule fois). */
export function loadCardFonts() {
  if (!fontsPromise) {
    const f = cardFonts();
    fontsPromise = document.fonts.ready
      .then(() =>
        Promise.all(
          [`300 100px ${f.display}`, `500 100px ${f.display}`, `400 100px ${f.serif}`, `300 100px ${f.sans}`, `400 100px ${f.sans}`].map((s) =>
            document.fonts.load(s).catch(() => []),
          ),
        ),
      )
      .then(() => undefined)
      .catch(() => undefined);
  }
  return fontsPromise;
}

/* ——————————————————————————————————————————————— Utilitaires */

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function spacing(ctx: Ctx, px: number) {
  const c = ctx as Ctx & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${px}px`;
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Coupe un texte en lignes (mots entiers), avec points de suspension au-delà de maxLines. */
export function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines: number) {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];
  for (const p of paragraphs) {
    let line = "";
    for (const word of p.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) line = test;
      else {
        if (line) lines.push(line);
        line = word;
        // mot plus long que la ligne : on le coupe
        while (ctx.measureText(line).width > maxWidth && line.length > 1) {
          let cut = line.length - 1;
          while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxWidth) cut--;
          lines.push(line.slice(0, cut));
          line = line.slice(cut);
        }
      }
    }
    if (line) lines.push(line);
  }
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

function grain(ctx: Ctx, ink: string, amount: number, seed: number) {
  const r = rng(seed);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = rgba(ink, r() * amount);
    const s = r() * 2.2 + 0.6;
    ctx.fillRect(r() * CARD_W, r() * CARD_H, s, s);
  }
}

/* ——————————————————————————————————————————————— Motifs */

function pebble(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, stops: [string, string, string], tilt = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.55, rx * 0.05, 0, 0, rx * 1.05);
  g.addColorStop(0, stops[0]);
  g.addColorStop(0.55, stops[1]);
  g.addColorStop(1, stops[2]);
  ctx.shadowColor = "rgba(34,27,29,0.28)";
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = g;
  ctx.beginPath();
  // galet légèrement irrégulier : ellipse dont le bas est plus plat
  ctx.moveTo(-rx, 0);
  ctx.bezierCurveTo(-rx, -ry * 1.05, rx * 0.95, -ry * 1.1, rx, -ry * 0.05);
  ctx.bezierCurveTo(rx * 1.02, ry * 0.9, -rx * 0.9, ry * 0.95, -rx, 0);
  ctx.fill();
  ctx.restore();
}

function blob(ctx: Ctx, cx: number, cy: number, r: number, seed: number, fill: string) {
  const rand = rng(seed);
  const n = 7;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = r * (0.78 + rand() * 0.4);
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k * 0.82] as const;
  });
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];
    const mx = (p0[0] + p1[0]) / 2;
    const my = (p0[1] + p1[1]) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    const p2 = pts[(i + 2) % n];
    ctx.quadraticCurveTo(p1[0], p1[1], (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2);
  }
  ctx.closePath();
  ctx.fill();
}

/** Dessine le motif décoratif. `scale` < 1 pour l'écho discret du verso. */
function drawMotif(ctx: Ctx, motif: MotifId, x: number, y: number, scale = 1, onPaper = false) {
  const m = motifDe(motif);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (motif === "galets") {
    pebble(ctx, 0, 250, 260, 92, ["#FFFFFF", "#D9CBBB", "#A89786"], -0.03);
    pebble(ctx, -18, 128, 196, 70, ["#F1F4EF", "#B8C6B5", "#7F917C"], 0.04);
    pebble(ctx, 22, 30, 134, 50, ["#7A6570", "#221B1D", "#23191F"], -0.05);
  } else if (motif === "brume") {
    // sur le papier clair du verso, l'onde prend la couleur de la sauge
    const line = onPaper ? "#7F917C" : m.accent;
    if (!onPaper) {
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 520);
      glow.addColorStop(0, rgba("#F8F5F2", 0.5));
      glow.addColorStop(1, rgba("#F8F5F2", 0));
      ctx.fillStyle = glow;
      ctx.fillRect(-620, -520, 1240, 1040);
    }
    [36, 84, 146, 222, 312, 416, 534, 666].forEach((r, i) => {
      ctx.strokeStyle = rgba(line, Math.max(0.12, 0.85 - i * 0.1));
      ctx.lineWidth = 3.2 - i * 0.22;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.34, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    // la goutte qui a fait l'onde
    ctx.fillStyle = onPaper ? "#9CAF9A" : rgba("#F8F5F2", 0.95);
    ctx.beginPath();
    ctx.moveTo(0, -250);
    ctx.bezierCurveTo(26, -206, 44, -176, 44, -150);
    ctx.bezierCurveTo(44, -124, 24, -106, 0, -106);
    ctx.bezierCurveTo(-24, -106, -44, -124, -44, -150);
    ctx.bezierCurveTo(-44, -176, -26, -206, 0, -250);
    ctx.fill();
  } else {
    blob(ctx, 120, 170, 330, 7, "#8B5E45");
    blob(ctx, 40, 90, 290, 3, m.accent);
    blob(ctx, 250, -230, 150, 11, rgba("#EFE2D8", 0.85));
    blob(ctx, -170, 300, 110, 5, rgba("#D4A78F", 0.55));
    // mouchetures de l'argile
    const r = rng(19);
    for (let i = 0; i < 380; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 330;
      ctx.fillStyle = rgba(i % 3 ? "#221B1D" : "#F8F5F2", 0.12 + r() * 0.2);
      ctx.beginPath();
      ctx.arc(40 + Math.cos(a) * d, 90 + Math.sin(a) * d * 0.8, 1 + r() * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ——————————————————————————————————————————————— Faces */

export function drawFront(ctx: Ctx, d: CardData, f: CardFonts) {
  const m = motifDe(d.motif);
  const ink = m.encre;
  const P = 96;
  ctx.save();
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = m.fond;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  if (d.motif === "brume") drawMotif(ctx, "brume", 1180, 640);
  else if (d.motif === "galets") drawMotif(ctx, "galets", 1255, 440);
  else drawMotif(ctx, "argile", 1260, 560);

  grain(ctx, ink, 0.07, 3);

  // En-tête
  ctx.fillStyle = rgba(ink, 0.78);
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 28px ${f.display}`;
  spacing(ctx, 7);
  ctx.fillText("BON CADEAU", P, P + 22);
  ctx.textAlign = "right";
  ctx.fillText(site.address.city.toUpperCase(), CARD_W - P, P + 22);
  ctx.textAlign = "left";

  // Valeur
  ctx.fillStyle = ink;
  spacing(ctx, 0);
  if (d.estSoin) {
    ctx.font = `400 104px ${f.serif}`;
    const lines = wrap(ctx, d.titre, 860, 2);
    lines.forEach((l, i) => ctx.fillText(l, P, 280 + i * 112));
    ctx.font = `300 38px ${f.display}`;
    ctx.fillStyle = rgba(ink, 0.78);
    ctx.fillText(wrap(ctx, d.detail, 860, 1)[0] ?? "", P, 280 + lines.length * 112 + 8);
  } else {
    ctx.font = `400 230px ${f.serif}`;
    ctx.fillText(d.titre, P - 8, 400);
    ctx.font = `300 38px ${f.display}`;
    ctx.fillStyle = rgba(ink, 0.78);
    ctx.fillText(wrap(ctx, d.detail, 860, 1)[0] ?? "", P, 470);
  }

  // Mot-marque
  ctx.fillStyle = ink;
  ctx.font = `300 270px ${f.display}`;
  spacing(ctx, -15);
  ctx.fillText("BRUME", P - 12, CARD_H - P + 16);
  spacing(ctx, 0);
  ctx.restore();
}

export function drawBack(ctx: Ctx, d: CardData, f: CardFonts) {
  const m = motifDe(d.motif);
  const dark = d.motif === "argile";
  const paper = dark ? "#46333D" : "#F8F5F2";
  const ink = dark ? "#F8F5F2" : "#221B1D";
  const soft = dark ? "#EFE6DF" : "#65535D";
  const P = 96;
  ctx.save();
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = m.fond;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  grain(ctx, m.encre, 0.07, 5);

  // panneau papier, avec un écho discret du motif dans le coin
  const px = 56;
  const py = 56;
  ctx.fillStyle = rgba(paper, dark ? 0.96 : 0.92);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(px, py, CARD_W - 2 * px, CARD_H - 2 * py, 44);
  else ctx.rect(px, py, CARD_W - 2 * px, CARD_H - 2 * py);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.85;
  drawMotif(ctx, d.motif, 1400, 770, 0.26, !dark);
  ctx.restore();
  grain(ctx, "#221B1D", 0.04, 9);

  const colX = 1060;
  // filet vertical
  ctx.strokeStyle = rgba(ink, 0.16);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(colX - 60, P + 30);
  ctx.lineTo(colX - 60, CARD_H - P - 90);
  ctx.stroke();

  const label = (t: string, x: number, y: number) => {
    ctx.fillStyle = rgba(soft, 1);
    ctx.font = `500 24px ${f.display}`;
    spacing(ctx, 6);
    ctx.fillText(t.toUpperCase(), x, y);
    spacing(ctx, 0);
  };

  // Colonne gauche : destinataire, expéditeur, message
  const left = P + 30;
  const maxW = colX - 60 - left - 50;
  label("Pour", left, P + 60);
  ctx.fillStyle = d.pour ? ink : rgba(ink, 0.35);
  ctx.font = `400 92px ${f.serif}`;
  ctx.fillText(wrap(ctx, d.pour || "Son prénom", maxW, 1)[0], left, P + 160);

  ctx.font = `300 38px ${f.display}`;
  ctx.fillStyle = d.de ? soft : rgba(soft, 0.55);
  ctx.fillText(wrap(ctx, `de la part de ${d.de || "…"}`, maxW, 1)[0], left, P + 222);

  const msg = d.message.trim();
  ctx.font = `300 40px ${f.sans}`;
  ctx.fillStyle = msg ? ink : rgba(ink, 0.38);
  const lines = wrap(ctx, msg ? `« ${msg} »` : "Votre message apparaîtra ici.", maxW, 6);
  lines.forEach((l, i) => ctx.fillText(l, left, P + 320 + i * 58));

  // Colonne droite : code, validité, valeur
  label("Code", colX, P + 60);
  ctx.fillStyle = ink;
  ctx.font = `500 44px ${f.display}`;
  spacing(ctx, 2);
  ctx.fillText(d.code || "BRM-····-····", colX, P + 128);
  spacing(ctx, 0);

  label("Valable jusqu'au", colX, P + 230);
  ctx.fillStyle = ink;
  ctx.font = `400 46px ${f.serif}`;
  ctx.fillText(wrap(ctx, d.validite, CARD_W - P - 30 - colX, 1)[0] ?? "", colX, P + 296);

  label("Valeur", colX, P + 398);
  ctx.font = `400 46px ${f.serif}`;
  const val = wrap(ctx, d.titre, CARD_W - P - 30 - colX, 2);
  val.forEach((l, i) => ctx.fillText(l, colX, P + 464 + i * 58));
  if (d.estSoin) {
    ctx.font = `300 30px ${f.display}`;
    ctx.fillStyle = soft;
    ctx.fillText(wrap(ctx, d.detail, CARD_W - P - 30 - colX, 1)[0] ?? "", colX, P + 464 + val.length * 58 + 4);
  }

  // Pied : coordonnées
  ctx.fillStyle = soft;
  ctx.font = `400 27px ${f.sans}`;
  ctx.fillText(`${site.name} · ${site.address.street}, ${site.address.postalCode} ${site.address.city} · ${site.contact.phone}`, left, CARD_H - P - 18);
  ctx.textAlign = "right";
  ctx.fillText("Sur rendez-vous", CARD_W - P - 30, CARD_H - P - 18);
  ctx.textAlign = "left";
  ctx.restore();
}
