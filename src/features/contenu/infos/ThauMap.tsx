"use client";

import { motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { site } from "@/config/site";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { INSTITUT, itineraireDepuis, trajets } from "./trajets";

const ETANG =
  "M70 560C90 500 150 440 205 395C240 365 262 318 292 290C330 262 380 236 426 212C448 202 464 206 470 218C476 236 482 258 492 262C504 264 512 246 512 232C516 206 520 182 530 170C542 160 552 168 556 180C562 204 574 226 590 244C604 262 606 286 596 306C586 326 566 340 545 346C520 356 494 366 470 378C440 394 410 406 380 422C346 442 312 462 280 482C250 502 220 522 190 540C162 558 136 576 110 588C88 596 66 584 70 560Z";
const COTE = "M800 262C766 266 734 276 700 285C672 294 646 304 625 318C606 332 598 346 598 362C598 380 594 396 586 404C576 414 566 420 552 426C524 436 498 444 470 452C440 466 410 480 380 495C350 512 320 530 290 548C258 568 228 586 200 605C184 616 166 628 150 640";
const MER = `${COTE}L800 640Z`;
const routes = trajets.filter((t) => t.route);
const gauche = (v: string) => v === "Mèze" || v === "Bouzigues";

/**
 * Carte du Bassin de Thau, dessinée à la main (SVG) : l'étang, le lido,
 * la mer, les villes voisines et l'institut. Survoler un trajet dans la
 * liste le met en évidence sur la carte.
 */
export function ThauMap({ children }: { children?: ReactNode }) {
  const reduced = useReducedMotion();
  const [actif, setActif] = useState<string | null>(null);
  const uid = useId().replace(/:/g, "");
  const draw = (delay: number, duration = 1.8) =>
    reduced
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.5 } }
      : { initial: { pathLength: 0, opacity: 0 }, whileInView: { pathLength: 1, opacity: 1 }, transition: { duration, delay, ease: ease.tide } };
  const vp = { once: true, amount: 0.35 };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <figure className="lg:col-span-7">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-[#EFE7DC]">
          <svg viewBox="0 0 800 640" className="block h-auto w-full" role="img" aria-labelledby={`t${uid} d${uid}`}>
            <title id={`t${uid}`}>Carte du Bassin de Thau</title>
            <desc id={`d${uid}`}>
              L&apos;institut BRUME se trouve à Balaruc-les-Bains, sur la presqu&apos;île au nord-est de l&apos;étang de Thau, entre Sète au sud,
              Frontignan à l&apos;est, Bouzigues et Mèze à l&apos;ouest.
            </desc>
            <defs>
              <pattern id={`w${uid}`} width="36" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
                <path d="M0 7c4.5-4 9-4 13.5 0s9 4 13.5 0 9-4 13.5 0" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1" />
              </pattern>
              <pattern id={`e${uid}`} width="28" height="12" patternUnits="userSpaceOnUse">
                <path d="M0 6c3.5-3 7-3 10.5 0s7 3 10.5 0 7-3 10.5 0" fill="none" stroke="#9CAF9A" strokeOpacity="0.35" strokeWidth="0.8" />
              </pattern>
              {routes.map((t, i) => (
                  <mask key={t.ville} id={`m${uid}-${i}`} maskUnits="userSpaceOnUse">
                    <motion.path d={t.route} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" viewport={vp} {...draw(1.4 + t.minutes * 0.03, 1.4)} />
                  </mask>
                ))}
            </defs>

            {/* Mer */}
            <motion.path d={MER} fill="#D9E3D6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={vp} transition={{ duration: 1.2, ease: ease.veil }} />
            <path d={MER} fill={`url(#w${uid})`} opacity="0.9" />
            <motion.path d={COTE} fill="none" stroke="#7F917C" strokeWidth="1.4" strokeLinecap="round" viewport={vp} {...draw(0.1, 2.2)} />

            {/* Étang */}
            <motion.path d={ETANG} fill="#E3E9E1" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={vp} transition={{ duration: 1.4, delay: 0.5, ease: ease.veil }} />
            <path d={ETANG} fill={`url(#e${uid})`} />
            <motion.path d={ETANG} fill="none" stroke="#7F917C" strokeWidth="1.4" viewport={vp} {...draw(0.2, 2.4)} />

            {/* Mont Saint-Clair */}
            {[26, 17, 9].map((r, i) => (
              <ellipse key={r} cx="566" cy="384" rx={r} ry={r * 0.65} fill="none" stroke="#221B1D" strokeOpacity={0.12 + i * 0.04} strokeWidth="0.9" />
            ))}

            <text x="300" y="418" transform="rotate(-33 300 418)" className="fill-sauge-deep font-serif" fontSize="26" fontStyle="italic" letterSpacing="1">
              Étang de Thau
            </text>
            <text x="560" y="560" transform="rotate(-22 560 560)" className="fill-sauge-deep/80 font-display" fontSize="15" letterSpacing="5">
              MER MÉDITERRANÉE
            </text>

            {/* Trajets */}
            {routes.map((t, i) => {
                const on = actif === t.ville;
                return (
                  <g key={t.ville} mask={`url(#m${uid}-${i})`}>
                    <path
                      d={t.route}
                      fill="none"
                      stroke="#221B1D"
                      strokeWidth={on ? 2.6 : 1.4}
                      strokeOpacity={actif && !on ? 0.2 : on ? 0.95 : 0.55}
                      strokeDasharray="2 6"
                      strokeLinecap="round"
                      className="transition-[stroke-width,stroke-opacity] duration-[var(--dur-3)] ease-[var(--ease-veil)]"
                    />
                  </g>
                );
              })}
            {trajets
              .filter((t) => t.label)
              .map((t, i) => (
                <motion.g
                  key={`l${t.ville}`}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.6, delay: reduced ? 0 : 2.4 + i * 0.12, ease: ease.veil }}
                >
                  <rect
                    x={t.label!.x - 30}
                    y={t.label!.y - 14}
                    width="60"
                    height="26"
                    rx="13"
                    className={cn("transition-colors duration-[var(--dur-2)] ease-[var(--ease-veil)]", actif === t.ville ? "fill-prune" : "fill-ecume")}
                    stroke="#221B1D"
                    strokeOpacity="0.2"
                  />
                  <text
                    x={t.label!.x}
                    y={t.label!.y + 4}
                    textAnchor="middle"
                    fontSize="12.5"
                    className={cn("font-display transition-colors duration-[var(--dur-2)] ease-[var(--ease-veil)]", actif === t.ville ? "fill-lait" : "fill-prune")}
                  >
                    {t.minutes} min
                  </text>
                </motion.g>
              ))}

            {/* Villes */}
            {trajets
              .filter((t) => t.x !== undefined)
              .map((t, i) => (
                <motion.g
                  key={t.ville}
                  initial={{ opacity: 0, scale: reduced ? 1 : 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={vp}
                  transition={{ duration: 0.7, delay: reduced ? 0 : 1 + i * 0.1, ease: ease.veil }}
                  style={{ transformOrigin: `${t.x}px ${t.y}px` }}
                >
                  <circle cx={t.x} cy={t.y} r={actif === t.ville ? 6 : 4} className="fill-prune transition-[r] duration-[var(--dur-2)] ease-[var(--ease-veil)]" />
                  <text
                    x={t.x! + (gauche(t.ville) ? -10 : 10)}
                    y={t.y! + (t.ville === "Sète" ? 18 : -8)}
                    textAnchor={gauche(t.ville) ? "end" : "start"}
                    fontSize={t.ville === "Sète" ? 19 : 14.5}
                    className="fill-prune font-display"
                  >
                    {t.ville}
                  </text>
                </motion.g>
              ))}

            {/* L'institut */}
            <g>
              {!reduced
                ? [0, 1, 2].map((i) => (
                    <motion.circle
                      key={i}
                      cx={INSTITUT.x}
                      cy={INSTITUT.y}
                      r="10"
                      fill="none"
                      stroke="#7E543C"
                      strokeWidth="1"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: [1, 4.2], opacity: [0.7, 0] }}
                      transition={{ duration: 3.2, delay: 2.2 + i * 1.05, repeat: Infinity, ease: ease.float }}
                      style={{ transformOrigin: `${INSTITUT.x}px ${INSTITUT.y}px` }}
                    />
                  ))
                : null}
              <motion.g
                initial={reduced ? { opacity: 0 } : { y: -80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={vp}
                transition={{ duration: 0.8, delay: reduced ? 0 : 1.6, ease: ease.fall }}
              >
                <path
                  d={`M${INSTITUT.x} ${INSTITUT.y - 34}c7 9 12 16 12 23a12 12 0 1 1-24 0c0-7 5-14 12-23Z`}
                  className="fill-argile-deep"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle cx={INSTITUT.x} cy={INSTITUT.y - 11} r="3.5" fill="#FFFFFF" />
              </motion.g>
              <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={vp} transition={{ duration: 0.6, delay: reduced ? 0 : 2.3, ease: ease.veil }}>
                <rect x={INSTITUT.x - 150} y={INSTITUT.y + 14} width="142" height="44" rx="22" className="fill-prune" />
                <text x={INSTITUT.x - 79} y={INSTITUT.y + 33} textAnchor="middle" fontSize="13" className="fill-lait font-display" letterSpacing="2">
                  BRUME
                </text>
                <text x={INSTITUT.x - 79} y={INSTITUT.y + 49} textAnchor="middle" fontSize="10.5" className="fill-lait/75 font-sans">
                  Balaruc-les-Bains
                </text>
              </motion.g>
            </g>

            {/* Nord & échelle */}
            <g transform="translate(730 70)" className="text-prune/60">
              <path d="M0 -26 L7 6 L0 0 L-7 6 Z" fill="currentColor" />
              <text y="24" textAnchor="middle" fontSize="12" className="fill-prune/60 font-display">
                N
              </text>
            </g>
            <g transform="translate(40 36)">
              <path d="M0 0h68" stroke="#221B1D" strokeOpacity="0.5" strokeWidth="1.2" />
              <path d="M0 -4v8M68 -4v8" stroke="#221B1D" strokeOpacity="0.5" strokeWidth="1.2" />
              <text x="34" y="-9" textAnchor="middle" fontSize="11" className="fill-prune/60 font-sans">
                2 km
              </text>
            </g>
          </svg>
        </div>
        <figcaption className="mt-3 text-[0.8125rem] text-prune-mute">Carte stylisée, dessinée pour BRUME. Temps de trajet indicatifs en voiture, hors bouchons d&apos;été.</figcaption>
      </figure>

      <div className="lg:col-span-5">
        {children}
        <h3 className="mt-10 font-display text-[1.35rem] font-light">Depuis chez vous</h3>
        <ul className="mt-4 border-t hairline" onMouseLeave={() => setActif(null)}>
          {trajets.map((t) => (
            <li key={t.ville} className="border-b hairline">
              <a
                href={itineraireDepuis(t.ville)}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setActif(t.ville)}
                onFocus={() => setActif(t.ville)}
                onBlur={() => setActif(null)}
                className="group flex min-h-12 items-center gap-4 py-3 transition-colors duration-[var(--dur-2)] ease-[var(--ease-veil)]"
              >
                <span className="tabular w-16 shrink-0 font-serif text-[1.35rem] leading-none text-argile-deep">
                  {t.minutes}
                  <span className="font-sans text-[0.75rem] text-prune-mute"> min</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display">{t.ville}</span>
                  {t.via ? <span className="block text-[0.8125rem] text-prune-mute">{t.via}</span> : null}
                </span>
                <span className="flex items-center gap-1.5 text-[0.8125rem] text-prune-mute transition-colors group-hover:text-prune duration-[var(--dur-2)] ease-[var(--ease-veil)]">
                  <span className="hidden sm:inline">Itinéraire</span>
                  <Icon name="fleche" size={16} className="transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:translate-x-1" />
                  <span className="sr-only">depuis {t.ville} (nouvel onglet)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.8125rem] text-prune-mute">{site.address.access[0]}</p>
      </div>
    </div>
  );
}
