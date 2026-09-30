/**
 * Bon cadeau en PDF (210 × 99 mm, paysage), généré dans le navigateur avec
 * jsPDF (import dynamique). Motif dessiné en formes vectorielles, polices de
 * la marque embarquées si disponibles, sinon Helvetica / Times.
 */
import type { jsPDF as JsPDF } from "jspdf";
import { site, siteUrl } from "@/config/site";
import type { CardData } from "./cardArt";
import { motifDe } from "./model";

type Doc = JsPDF;
interface PdfFonts {
  light: [string, string];
  medium: [string, string];
  serif: [string, string];
  unicode: boolean;
}

const PAGE_W = 210;
const PAGE_H = 99;

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

let fontCache: Promise<{ light: string; medium: string; serif: string } | null> | null = null;

function loadBrandFonts() {
  if (!fontCache) {
    const files = {
      light: new URL("../../assets/fonts/Manrope-wght-300.ttf", import.meta.url),
      medium: new URL("../../assets/fonts/Manrope-wght-500.ttf", import.meta.url),
      serif: new URL("../../assets/fonts/Gloock.ttf", import.meta.url),
    };
    fontCache = Promise.all(
      Object.values(files).map(async (u) => {
        const r = await fetch(u);
        if (!r.ok) throw new Error(String(r.status));
        return toBase64(await r.arrayBuffer());
      }),
    )
      .then(([light, medium, serif]) => ({ light, medium, serif }))
      .catch(() => null);
  }
  return fontCache;
}

async function setupFonts(doc: Doc): Promise<PdfFonts> {
  const brand = await loadBrandFonts();
  if (brand) {
    try {
      doc.addFileToVFS("Manrope-Light.ttf", brand.light);
      doc.addFont("Manrope-Light.ttf", "ManropeLight", "normal");
      doc.addFileToVFS("Manrope-Medium.ttf", brand.medium);
      doc.addFont("Manrope-Medium.ttf", "ManropeMedium", "normal");
      doc.addFileToVFS("Gloock.ttf", brand.serif);
      doc.addFont("Gloock.ttf", "Gloock", "normal");
      return { light: ["ManropeLight", "normal"], medium: ["ManropeMedium", "normal"], serif: ["Gloock", "normal"], unicode: true };
    } catch {
      /* polices standard ci-dessous */
    }
  }
  return { light: ["helvetica", "normal"], medium: ["helvetica", "bold"], serif: ["times", "normal"], unicode: false };
}

/** Nettoie un texte pour les polices PDF (espaces fines, caractères hors jeu). */
function clean(text: string, unicode: boolean) {
  const t = text.replace(/[   ]/g, " ").replace(/\s+/g, " ").trim();
  if (unicode) return t.replace(/[^ -ɏ–—‘’“”…€ «»]/g, "");
  // WinAnsi (cp1252)
  return t.replace(/[^ -ÿ–—‘’‚“”„…€Œœ]/g, "");
}

/** Contour fermé lissé (Catmull-Rom → Bézier) à partir de points. */
function smoothBlob(doc: Doc, pts: [number, number][], style: "F" | "S") {
  const n = pts.length;
  const segs: number[][] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    segs.push([c1[0] - p1[0], c1[1] - p1[1], c2[0] - p1[0], c2[1] - p1[1], p2[0] - p1[0], p2[1] - p1[1]]);
  }
  doc.lines(segs, pts[0][0], pts[0][1], [1, 1], style, true);
}

function blobPoints(cx: number, cy: number, r: number, seed: number): [number, number][] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    const k = r * (0.8 + rand() * 0.36);
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k * 0.8];
  });
}

function drawMotif(doc: Doc, d: CardData, GState: typeof import("jspdf").GState) {
  const m = motifDe(d.motif);
  const opacity = (o: number) => doc.setGState(new GState({ opacity: o }));
  if (d.motif === "galets") {
    const pebble = (x: number, y: number, rx: number, ry: number, base: string, light: string) => {
      opacity(0.14);
      doc.setFillColor("#3B2A33");
      doc.ellipse(x + 0.6, y + ry * 0.75, rx * 0.95, ry * 0.45, "F");
      opacity(1);
      doc.setFillColor(base);
      doc.ellipse(x, y, rx, ry, "F");
      opacity(0.45);
      doc.setFillColor(light);
      doc.ellipse(x - rx * 0.2, y - ry * 0.32, rx * 0.6, ry * 0.46, "F");
      opacity(1);
    };
    pebble(92, 75, 19, 6.6, "#C9B6A2", "#F4EEE6");
    pebble(90.5, 64.5, 14.5, 5.2, "#9DAF9A", "#E3E9E1");
    pebble(92.5, 55.2, 10, 3.8, "#3B2A33", "#6A5560");
  } else if (d.motif === "brume") {
    doc.setDrawColor(m.accent);
    [3, 7, 12, 18, 25, 33, 42, 52].forEach((r, i) => {
      opacity(Math.max(0.15, 0.9 - i * 0.1));
      doc.setLineWidth(Math.max(0.18, 0.45 - i * 0.04));
      doc.ellipse(88, 67, r, r * 0.34, "S");
    });
    opacity(0.95);
    doc.setFillColor("#FAF6F1");
    doc.circle(88, 55.4, 2.3, "F");
    doc.triangle(88, 49.4, 85.95, 54.5, 90.05, 54.5, "F");
    opacity(1);
  } else {
    doc.setFillColor("#8B5E45");
    smoothBlob(doc, blobPoints(94, 72, 20, 7), "F");
    doc.setFillColor(m.accent);
    smoothBlob(doc, blobPoints(89, 67, 17, 3), "F");
    opacity(0.8);
    doc.setFillColor("#EFE2D8");
    smoothBlob(doc, blobPoints(102, 38, 8, 11), "F");
    opacity(0.5);
    doc.setFillColor("#C9A48A");
    smoothBlob(doc, blobPoints(72, 84, 6, 5), "F");
    let s = 19;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (let i = 0; i < 90; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 18;
      opacity(0.15 + rand() * 0.25);
      doc.setFillColor(i % 3 ? "#3B2A33" : "#FAF6F1");
      doc.circle(89 + Math.cos(a) * r, 67 + Math.sin(a) * r * 0.8, 0.12 + rand() * 0.25, "F");
    }
    opacity(1);
  }
}

export async function genererPdf(d: CardData) {
  const { jsPDF, GState } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [PAGE_W, PAGE_H], compress: true });
  const f = await setupFonts(doc);
  const t = (s: string) => clean(s, f.unicode);
  const m = motifDe(d.motif);
  const soft = "#65535D";
  const prune = "#3B2A33";

  doc.setProperties({
    title: `Bon cadeau ${site.name} ${d.code}`,
    subject: `Bon cadeau ${site.fullName}`,
    author: site.fullName,
    creator: site.fullName,
  });

  // Fond
  doc.setFillColor("#FFFDFA");
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Panneau motif (recto)
  const px = 6;
  const py = 6;
  const pw = 110;
  const ph = PAGE_H - 12;
  doc.setFillColor(m.fond);
  doc.roundedRect(px, py, pw, ph, 5, 5, "F");
  doc.saveGraphicsState();
  doc.roundedRect(px, py, pw, ph, 5, 5, null);
  doc.clip();
  doc.discardPath();
  drawMotif(doc, d, GState);
  doc.restoreGraphicsState();

  doc.setTextColor(m.encre);
  doc.setFont(...f.medium);
  doc.setFontSize(6.5);
  doc.text("BON CADEAU", 13, 16, { charSpace: 0.9 });
  // alignement à droite calculé à la main : jsPDF ignore l'interlettrage pour `align: "right"`
  const ville = t(site.address.city.toUpperCase());
  doc.text(ville, px + pw - 7 - (doc.getTextWidth(ville) + 0.9 * (ville.length - 1)), 16, { charSpace: 0.9 });

  if (d.estSoin) {
    doc.setFont(...f.serif);
    doc.setFontSize(20);
    const lines = (doc.splitTextToSize(t(d.titre), 64) as string[]).slice(0, 2);
    doc.text(lines, 12.5, 31, { lineHeightFactor: 1.05 });
    doc.setFont(...f.light);
    doc.setFontSize(8);
    doc.text(t(d.detail), 13, 31 + lines.length * 7.4 + 1);
  } else {
    doc.setFont(...f.serif);
    doc.setFontSize(46);
    doc.text(t(d.titre), 11.5, 41);
    doc.setFont(...f.light);
    doc.setFontSize(8);
    doc.text(t(d.detail), 13, 48.5);
  }

  doc.setFont(...f.light);
  doc.setFontSize(44);
  doc.text("BRUME", 11, 86, { charSpace: -0.7 });

  // Verso : informations
  const x = 125;
  const right = PAGE_W - 8;
  const label = (s: string, lx: number, ly: number) => {
    doc.setFont(...f.medium);
    doc.setFontSize(6.2);
    doc.setTextColor(soft);
    doc.text(s.toUpperCase(), lx, ly, { charSpace: 0.7 });
  };

  label("Pour", x, 16);
  doc.setFont(...f.serif);
  doc.setFontSize(21);
  doc.setTextColor(prune);
  doc.text((doc.splitTextToSize(t(d.pour), right - x) as string[])[0] ?? "", x, 25.5);
  doc.setFont(...f.light);
  doc.setFontSize(9.5);
  doc.setTextColor(soft);
  doc.text((doc.splitTextToSize(t(`de la part de ${d.de}`), right - x) as string[])[0] ?? "", x, 31.5);

  const msg = t(d.message);
  if (msg) {
    doc.setFont(...f.light);
    doc.setFontSize(9);
    doc.setTextColor(prune);
    let lines = doc.splitTextToSize(`« ${msg} »`, right - x) as string[];
    if (lines.length > 6) lines = [...lines.slice(0, 5), `${lines[5].replace(/\s*\S*$/, "")}…`];
    doc.text(lines, x, 40, { lineHeightFactor: 1.35 });
  }

  doc.setDrawColor("#D8CFD3");
  doc.setLineWidth(0.25);
  doc.line(x, 67, right, 67);

  label("Code", x, 73);
  doc.setFont(...f.medium);
  doc.setFontSize(12);
  doc.setTextColor(prune);
  doc.text(d.code, x, 79.5, { charSpace: 0.35 });

  label("Valable jusqu'au", 167, 73);
  doc.setFont(...f.serif);
  doc.setFontSize(11.5);
  doc.text(t(d.validite), 167, 79.5);

  doc.setFont(...f.light);
  doc.setFontSize(5.6);
  doc.setTextColor(soft);
  const host = siteUrl.replace(/^https?:\/\//, "");
  [
    `${site.address.street}, ${site.address.postalCode} ${site.address.city} · ${site.contact.phone}`,
    `Valable ${site.policies.giftValidityMonths} mois, non remboursable, non échangeable contre des espèces.`,
    "Activé après règlement. Soins sur rendez-vous.",
    `Conditions générales de vente : ${host}/cgv-bons-cadeaux`,
  ].forEach((line, i) => doc.text((doc.splitTextToSize(t(line), right - x) as string[])[0] ?? "", x, 85.2 + i * 2.8));

  doc.save(`bon-cadeau-BRUME-${d.code}.pdf`);
}
