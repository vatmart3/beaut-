"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { site } from "@/config/site";
import { fromIso, isoDate, joursDisponibles, type Creneau } from "@/data/planning";
import { getSoin, formatDuree } from "@/data/soins";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { useLenis } from "@/components/layout/SmoothScroll";
import { DropProgress } from "./DropProgress";
import { StepSoin } from "./StepSoin";
import { StepPraticienne } from "./StepPraticienne";
import { StepCreneau } from "./StepCreneau";
import { StepVous } from "./StepVous";
import { RecapDrawer, RecapSidebar, type RecapData } from "./Recap";
import { Confirmation } from "./Confirmation";
import { useNow } from "./useNow";
import { creneauxPour, heureFr, jourLong } from "./slots";
import {
  choixPour,
  libellePraticienne,
  PRATICIENNES,
  reservationSchema,
  resolvePrestation,
  type ChoixPraticienne,
  type Coordonnees,
  type ReservationResponse,
} from "./schema";

const STEPS = [
  { court: "Soin", titre: "Quel soin ?", sous: "Choisissez dans la carte, ou cherchez par mot-clé." },
  { court: "Praticienne", titre: "Avec qui ?", sous: "Deux praticiennes, deux mains différentes. Ou la première libre." },
  { court: "Créneau", titre: "Quand ?", sous: "Les disponibilités sont calculées à l'instant, sur le planning réel." },
  { court: "Vous", titre: "À propos de vous", sous: "Trente secondes, et votre demande part." },
];

interface Sel {
  slug?: string;
  variante: number | null;
  choix?: ChoixPraticienne;
  date?: string;
  heure?: string;
  attribuee?: string;
}

interface Init {
  sel: Sel;
  step: number;
  pending: { date: string; heure: string } | null;
  pref?: ChoixPraticienne;
}

/** État initial depuis l'URL : ?soin=&variante=&praticienne=&date=&heure= */
function fromParams(sp: URLSearchParams): Init {
  const prefRaw = sp.get("praticienne");
  const pref = PRATICIENNES.find((p) => p === prefRaw);
  const soin = getSoin(sp.get("soin") ?? "");
  if (!soin) return { sel: { variante: null }, step: 0, pending: null, pref };

  let variante: number | null = null;
  if (soin.variantes?.length) {
    const n = Number(sp.get("variante"));
    variante = sp.get("variante") !== null && Number.isInteger(n) && n >= 0 && n < soin.variantes.length ? n : 0;
  }
  const options = choixPour(soin);
  const choix = pref && options.includes(pref) ? pref : options.length === 1 ? options[0] : undefined;

  const d = sp.get("date");
  const h = sp.get("heure")?.replace(/h/i, ":");
  const pending = d && h && /^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{2}:\d{2}$/.test(h) ? { date: d, heure: h } : null;

  return { sel: { slug: soin.slug, variante, choix }, step: pref && choix ? 2 : 1, pending, pref };
}

export function ReservationFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const now = useNow();

  const [init] = useState(() => fromParams(new URLSearchParams(params.toString())));
  const [sel, setSel] = useState<Sel>(init.sel);
  const [step, setStep] = useState(init.step);
  const [pending, setPending] = useState(init.pending);
  const [coords, setCoords] = useState<Coordonnees | undefined>();
  const [error, setError] = useState<{ message: string; creneau?: boolean } | null>(null);
  const [done, setDone] = useState<{ reference: string; demo: boolean; prenom: string } | null>(null);
  const [announce, setAnnounce] = useState("");
  const rootRef = useRef<HTMLElement>(null);
  const focusNext = useRef(false);

  const presta = resolvePrestation(sel.slug, sel.variante);

  // Lien profond avec date + heure (depuis l'accueil) : appliqué une seule
  // fois, dès que l'heure réelle est connue, si le créneau existe vraiment.
  if (pending && now) {
    setPending(null);
    const choix = sel.choix ?? (presta ? choixPour(presta.soin)[0] : undefined);
    const horizon = joursDisponibles(now).map(isoDate);
    const c =
      presta && choix && horizon.includes(pending.date)
        ? creneauxPour(pending.date, presta.duree, choix, now).find((x) => x.heure === pending.heure)
        : undefined;
    if (c && choix) {
      setSel((s) => ({ ...s, choix, date: pending.date, heure: pending.heure, attribuee: c.praticienne }));
      setStep(3);
    }
  }

  const reachable = !presta ? 0 : !sel.choix ? 1 : !sel.date || !sel.heure ? 2 : 3;

  const scrollToTop = () => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      if (lenis) lenis.scrollTo(el, { offset: -24, duration: reduced ? 0 : 0.9 });
      else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  };

  const go = (i: number, message?: string) => {
    setError(null);
    focusNext.current = true;
    setStep(i);
    setAnnounce(`${message ? `${message} ` : ""}Étape ${i + 1} sur 4 : ${STEPS[i].titre}`);
    scrollToTop();
  };

  /** Le créneau choisi tient-il toujours avec cette durée / cette praticienne ? */
  const heureValide = (duree: number, choix: ChoixPraticienne | undefined, s: Sel) => {
    if (!now || !choix || !s.date || !s.heure) return undefined;
    return creneauxPour(s.date, duree, choix, now).find((c) => c.heure === s.heure);
  };

  const chooseSoin = (slug: string, variante: number | null) => {
    const p = resolvePrestation(slug, variante);
    if (!p) return;
    const options = choixPour(p.soin);
    const choix =
      sel.choix && options.includes(sel.choix)
        ? sel.choix
        : init.pref && options.includes(init.pref)
          ? init.pref
          : options.length === 1
            ? options[0]
            : undefined;
    const keep = heureValide(p.duree, choix, sel);
    setSel({ slug, variante, choix, date: sel.date, heure: keep?.heure, attribuee: keep?.praticienne });
    const next = !choix || (!sel.choix && !init.pref) ? 1 : keep ? 3 : 2;
    go(next, `Soin choisi : ${p.label}, ${formatDuree(p.duree)}.`);
  };

  const chooseChoix = (choix: ChoixPraticienne) => {
    if (!presta) return;
    const keep = heureValide(presta.duree, choix, sel);
    setSel((s) => ({ ...s, choix, heure: keep?.heure, attribuee: keep?.praticienne }));
    go(keep ? 3 : 2, `${libellePraticienne(choix)}.`);
  };

  const pickDate = (iso: string) => {
    setSel((s) => ({ ...s, date: iso, heure: undefined, attribuee: undefined }));
  };

  const pickSlot = (iso: string, c: Creneau) => {
    setSel((s) => ({ ...s, date: iso, heure: c.heure, attribuee: c.praticienne }));
    go(3, `Créneau choisi : ${jourLong(fromIso(iso))} à ${heureFr(c.heure)}.`);
  };

  const submit = async (v: Coordonnees) => {
    setCoords(v);
    setError(null);
    const payload = { soin: sel.slug, variante: sel.variante, praticienne: sel.choix, date: sel.date, heure: sel.heure, ...v };
    const parsed = reservationSchema.safeParse(payload);
    if (!parsed.success) {
      setError({ message: "Il manque une information : vérifiez le soin, la praticienne et le créneau dans le récapitulatif." });
      return;
    }
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as ReservationResponse;
      if (!data.ok) {
        setError({ message: data.error, creneau: data.code === "creneau" });
        setAnnounce(data.error);
        return;
      }
      setDone({ reference: data.reference, demo: data.demo, prenom: v.prenom });
      setAnnounce(`Demande envoyée. Référence ${data.reference}.`);
      scrollToTop();
    } catch {
      const message = `La connexion a été interrompue. Réessayez, ou appelez-nous au ${site.contact.phone}.`;
      setError({ message });
      setAnnounce(message);
    }
  };

  const reset = () => {
    setSel({ variante: null });
    setCoords(undefined);
    setDone(null);
    setError(null);
    router.replace("/reserver", { scroll: false });
    go(0);
  };

  const recap: RecapData = { presta, choix: sel.choix, attribuee: sel.attribuee, date: sel.date, heure: sel.heure };
  const titleRef = (el: HTMLHeadingElement | null) => {
    if (el && focusNext.current) {
      focusNext.current = false;
      el.focus({ preventScroll: true });
    }
  };

  const current = Math.min(step, reachable);

  return (
    <>
      <section ref={rootRef} aria-label="Réservation en ligne" className="shell scroll-mt-4 px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pb-14 lg:pt-12">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announce}
        </p>

        {done && presta && sel.choix && sel.date && sel.heure ? (
          <Confirmation
            reference={done.reference}
            demo={done.demo}
            presta={presta}
            choix={sel.choix}
            attribuee={sel.attribuee}
            date={sel.date}
            heure={sel.heure}
            prenom={done.prenom}
            onReset={reset}
          />
        ) : (
          <div className="grid gap-10 pb-24 lg:grid-cols-12 lg:gap-12 lg:pb-0">
            <div className="min-w-0 lg:col-span-8">
              <div className="max-w-xl">
                <DropProgress steps={STEPS.map((s) => s.court)} current={current} reachable={reachable} onGo={(i) => go(i)} />
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current}
                  className="mt-10"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(6px)" }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease: ease.veil }}
                >
                  <header className="mb-8 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-baseline sm:gap-5">
                    <span aria-hidden className="tabular font-serif text-[2.25rem] leading-none text-argile-deep">
                      {String(current + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 ref={titleRef} tabIndex={-1} className="font-display text-[clamp(1.9rem,1.3rem+2.2vw,3.25rem)] font-light leading-[1.02] tracking-[-0.035em] outline-none">
                        <span className="sr-only">Étape {current + 1} sur 4 : </span>
                        {STEPS[current].titre}
                      </h2>
                      <p className="mt-2 text-prune-soft">{STEPS[current].sous}</p>
                    </div>
                  </header>

                  <div>
                    {current === 0 ? <StepSoin slug={sel.slug} variante={sel.variante} onChoose={chooseSoin} /> : null}
                    {current === 1 && presta ? <StepPraticienne presta={presta} choix={sel.choix} now={now} onChoose={chooseChoix} /> : null}
                    {current === 2 && presta && sel.choix ? (
                      <StepCreneau
                        presta={presta}
                        choix={sel.choix}
                        now={now}
                        date={sel.date}
                        heure={sel.heure}
                        onPickDate={pickDate}
                        onPickSlot={pickSlot}
                      />
                    ) : null}
                    {current === 3 ? (
                      <StepVous
                        initial={coords}
                        onChange={setCoords}
                        onSubmit={submit}
                        error={
                          error
                            ? {
                                message: error.message,
                                onRetry: error.creneau
                                  ? () => {
                                      setSel((s) => ({ ...s, heure: undefined, attribuee: undefined }));
                                      go(2);
                                    }
                                  : undefined,
                              }
                            : null
                        }
                      />
                    ) : null}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-28">
                <RecapSidebar data={recap} reachable={reachable} onEdit={(s) => go(s)} />
              </div>
            </div>
          </div>
        )}
      </section>
      {!done ? <RecapDrawer data={recap} reachable={reachable} onEdit={(s) => go(s)} /> : null}
    </>
  );
}
