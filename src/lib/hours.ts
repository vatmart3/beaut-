import { site, type DayKey } from "@/config/site";

const abbr: Record<DayKey, string> = {
  lundi: "lun.",
  mardi: "mar.",
  mercredi: "mer.",
  jeudi: "jeu.",
  vendredi: "ven.",
  samedi: "sam.",
  dimanche: "dim.",
};

/** "09:30" → "9 h 30", "19:00" → "19 h" */
export function h(hhmm: string) {
  const [H, M] = hhmm.split(":");
  return `${Number(H)} h${M === "00" ? "" : ` ${M}`}`;
}

/** Lignes regroupées : [{ jours: "mar. – ven.", plages: "9 h 30 – 19 h" }, …] */
export function hoursGrouped() {
  const out: { jours: string; plages: string }[] = [];
  let start: DayKey | null = null;
  let prev: DayKey | null = null;
  let current = "";
  const flush = () => {
    if (start && prev) out.push({ jours: start === prev ? abbr[start] : `${abbr[start]} – ${abbr[prev]}`, plages: current });
  };
  for (const d of site.hours) {
    const plages = d.ranges.length ? d.ranges.map((r) => `${h(r.opens)} – ${h(r.closes)}`).join(", ") : "fermé";
    if (plages === current && prev) {
      prev = d.day;
    } else {
      flush();
      start = d.day;
      prev = d.day;
      current = plages;
    }
  }
  flush();
  return out;
}

export function hoursShort() {
  return hoursGrouped()
    .filter((g) => g.plages !== "fermé")
    .map((g) => `${g.jours} ${g.plages}`)
    .join(" · ");
}

/** Statut en temps réel (« Ouvert jusqu'à 19 h » / « Fermé · ouvre mardi à 9 h 30 »). */
export function openStatus(now = new Date()) {
  const keys: DayKey[] = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const today = site.hours.find((x) => x.day === keys[now.getDay()])!;
  const r = today.ranges.find((r) => minutes >= toMin(r.opens) && minutes < toMin(r.closes));
  if (r) return { open: true, label: `Ouvert jusqu'à ${h(r.closes)}` };
  for (let i = 0; i < 8; i++) {
    const day = keys[(now.getDay() + i) % 7];
    const d = site.hours.find((x) => x.day === day)!;
    const next = d.ranges.find((r) => i > 0 || toMin(r.opens) > minutes);
    if (next) return { open: false, label: `Fermé · ouvre ${i === 0 ? "aujourd'hui" : i === 1 ? "demain" : day} à ${h(next.opens)}` };
  }
  return { open: false, label: "Fermé" };
}
