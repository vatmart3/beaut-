"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/config/site";
import { getSoin, formatPrix, formatDuree } from "@/data/soins";
import { Icon } from "@/components/icons/Icon";
import { use3DCapable, useCoarsePointer, useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";
import { dropState } from "./dropState";
import s from "./hero.module.css";

gsap.registerPlugin(ScrollTrigger);

const HeroDrop = dynamic(() => import("@/components/three/HeroDrop"), { ssr: false });

const LETTERS = ["B", "R", "U", "M", "E"];
const featured = getSoin("hydratation-profonde")!;

/**
 * Hero « portrait » : composition demandée par le client (image de référence).
 * Coquille arrondie, accroche en haut à gauche, mot-marque géant derrière le
 * portrait, carte soin arrondie posée sur l'épaule et reliée à la joue par un
 * trait fin. La goutte 3D flotte devant les lettres et tombe au scroll.
 */
export function Hero() {
  const shell = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });
  const progress = useRef(0);
  const home = useRef({ x: 0.88, y: 0.45, r: 60 });
  const capable = use3DCapable();
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [tilt, setTilt] = useState<"idle" | "ask" | "on">("idle");

  // Position de repos de la goutte : au-dessus de la dernière lettre (E).
  const measure = useCallback(() => {
    const sh = shell.current;
    const all = word.current?.querySelectorAll<HTMLElement>("[data-letter]");
    const e = all?.[all.length - 1];
    if (!sh || !e) return;
    const a = sh.getBoundingClientRect();
    const b = e.getBoundingClientRect();
    const wide = a.width >= 1000;
    const r = Math.max(24, Math.min(a.height * 0.072, a.width * 0.065, 82));
    home.current = {
      x: (b.left + b.width * (wide ? 0.42 : 0.3) - a.left) / a.width,
      y: (b.top + b.height * (wide ? 0.22 : 0.05) - a.top) / a.height,
      r,
    };
    dropState.x = home.current.x;
    if (fallback.current) {
      fallback.current.style.left = `${home.current.x * 100}%`;
      fallback.current.style.top = `${home.current.y * 100}%`;
      fallback.current.style.width = `${r * 2}px`;
    }
  }, []);

  useEffect(() => {
    const seen = document.documentElement.hasAttribute("data-seen");
    const t = setTimeout(() => {
      measure();
      setIntroDone(true);
    }, seen ? 1500 : 2500);
    const ro = new ResizeObserver(() => measure());
    if (shell.current) ro.observe(shell.current);
    document.fonts?.ready.then(measure);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [measure]);

  // Souris → pointeur normalisé
  useEffect(() => {
    const sh = shell.current;
    if (!sh || coarse) return;
    const onMove = (e: PointerEvent) => {
      const r = sh.getBoundingClientRect();
      pointer.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, active: true };
      if (fallback.current && !capable) {
        fallback.current.style.translate = `${(pointer.current.x - 0.5) * 60}px ${(pointer.current.y - 0.5) * 50}px`;
      }
    };
    const onLeave = () => (pointer.current = { ...pointer.current, active: false });
    sh.addEventListener("pointermove", onMove);
    sh.addEventListener("pointerleave", onLeave);
    return () => {
      sh.removeEventListener("pointermove", onMove);
      sh.removeEventListener("pointerleave", onLeave);
    };
  }, [coarse, capable]);

  // Inclinaison du téléphone (DeviceOrientation) — autorisation requise sur iOS.
  const startTilt = useCallback(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      const g = Math.max(-35, Math.min(35, e.gamma ?? 0));
      const b = Math.max(10, Math.min(80, e.beta ?? 45));
      pointer.current = { x: 0.5 + g / 70, y: (b - 10) / 70, active: true };
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  useEffect(() => {
    if (!coarse || reduced || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> };
    if (typeof DOE.requestPermission === "function") {
      const id = requestAnimationFrame(() => setTilt("ask"));
      return () => cancelAnimationFrame(id);
    }
    return startTilt();
  }, [coarse, reduced, startTilt]);

  const askTilt = async () => {
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> };
    try {
      const res = await DOE.requestPermission?.();
      if (res === "granted") {
        startTilt();
        setTilt("on");
      }
      else setTilt("idle");
    } catch {
      setTilt("idle");
    }
  };

  // Scroll : la goutte tombe, parallaxe douce du portrait et de l'accroche.
  useEffect(() => {
    const sh = shell.current;
    if (!sh) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sh,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          progress.current = self.progress;
          if (fallback.current && !reduced) {
            const f = self.progress * self.progress;
            fallback.current.style.transform = `translate(-50%, calc(-50% + ${f * sh.clientHeight * 0.95}px)) scaleY(${1 + f * 0.3})`;
          }
        },
      });
      if (reduced) return;
      gsap.to(portrait.current, { yPercent: 7, ease: "none", scrollTrigger: { trigger: sh, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(intro.current, { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: sh, start: "top top", end: "45% top", scrub: true } });
    }, sh);
    return () => ctx.revert();
  }, [reduced]);

  const show3D = capable === true && introDone;

  return (
    <section
      ref={shell}
      aria-labelledby="hero-title"
      className={cn(s.hero, "shell relative isolate h-[max(640px,calc(100svh-1.5rem))] overflow-hidden md:max-h-[1100px] md:min-h-[680px]")}
    >
      {/* Accroche (h1) — en haut à gauche, comme la référence */}
      <div ref={intro} className="absolute inset-x-5 top-[104px] z-30 sm:inset-x-10 sm:top-[120px] lg:left-[calc(var(--spacing-gutter)+1rem)] lg:right-auto lg:top-[19%]">
        <div className={s.intro}>
          <h1 id="hero-title" className="max-w-[19ch] xl:max-w-[21ch] font-display text-[clamp(1.3rem,0.95rem+1.05vw,2.05rem)] font-light leading-[1.18] tracking-[-0.025em]">
            <span className="sr-only">BRUME — </span>
            Institut de soins à <span className="whitespace-nowrap">Balaruc-les-Bains&#8239;:</span> visage, corps et rituels en duo
          </h1>
          <Link href="#rituel" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-prune/35 px-4 font-display text-[0.85rem] xl:hidden">
            Votre rituel en 4 questions
            <Icon name="fleche-bas" size={15} />
          </Link>
        </div>
      </div>

      {/* Mot-marque géant, derrière le portrait */}
      <div
        ref={word}
        aria-hidden
        className={cn(
          s.wordmark,
          "absolute inset-x-4 z-10 flex select-none justify-between font-display font-normal leading-[0.8] tracking-[-0.04em] text-prune sm:inset-x-8 md:inset-x-[calc(var(--spacing-gutter)+0.5rem)]",
        )}
      >
        {LETTERS.map((l, i) => (
          <span key={l} className={s.mask}>
            <span data-letter className={s.letter} style={{ ["--i" as string]: i }}>
              {l}
            </span>
          </span>
        ))}
      </div>

      {/* Goutte : 3D (réfracte le mot-marque) ou fallback SVG */}
      {capable ? (
        <div className={cn("absolute inset-0 z-[15] transition-opacity duration-700 ease-[var(--ease-veil)]", ready && show3D ? "opacity-100" : "opacity-0")}>
          {show3D ? <HeroDrop shell={shell} word={word} pointer={pointer} progress={progress} home={home} lite={coarse} onReady={() => setReady(true)} /> : null}
        </div>
      ) : null}
      {capable === false || capable === null ? (
        <div
          ref={fallback}
          aria-hidden
          className={cn("absolute z-[15] aspect-[1/1.3] w-[120px] -translate-x-1/2 -translate-y-1/2 transition-[translate] duration-[1200ms] ease-[var(--ease-veil)]", s.fallbackDrop)}
          style={{ left: "88%", top: "45%" }}
        >
          <DropSvg />
        </div>
      ) : null}

      {/* Portrait détouré */}
      <div ref={portrait} className="pointer-events-none absolute inset-y-0 left-1/2 z-20 flex -translate-x-1/2 items-end">
        <div className={cn(s.portrait, "pointer-events-auto relative")}>
          <div className={cn(s.portraitClip, "absolute inset-0")}>
          <div className={cn(s.portraitInner, "absolute inset-0")}>
            <Image
              src="/images/hero-modele.png"
              alt={`Portrait d'une femme au teint lumineux après un soin visage à l'institut BRUME, Balaruc-les-Bains`}
              fill
              preload
              fetchPriority="high"
              sizes="(min-width: 1024px) 42vw, (min-width: 768px) 60vw, 90vw"
              quality={80}
              className="object-contain object-bottom"
            />
          </div>
          </div>

          {/* Trait fin joue → carte */}
          <svg aria-hidden viewBox="0 0 1197 1700" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <path className={s.line} pathLength={1} d="M770 860 L 1060 1180 L 1060 1250" fill="none" stroke="#221B1D" strokeOpacity="0.4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <span aria-hidden className={cn(s.hotspot, "absolute left-[64.3%] top-[50.6%] grid size-3 place-items-center")}>
            <span className={cn(s.pulse, "absolute inset-0 rounded-full border border-white")} />
            <span className="size-2 rounded-full border border-white bg-white/40" />
          </span>

          {/* Carte soin — couvre exactement la zone de la carte d'origine */}
          <article
            className={cn(
              s.card,
              "absolute left-[4%] top-[74%] w-[min(86vw,320px)] overflow-hidden rounded-[18px] border border-white/70 bg-[linear-gradient(115deg,rgba(245,232,224,0.8),rgba(255,255,255,0.7))] shadow-[0_24px_60px_-24px_rgba(34,27,29,0.45)] backdrop-blur-xl sm:left-[40%] sm:rounded-[24px] lg:left-[52%] lg:top-[71%] lg:w-[clamp(400px,34vw,540px)]",
            )}
          >
            <div className="flex items-stretch gap-2.5 p-2 sm:gap-4 sm:p-3 lg:p-3.5">
              <div className="relative aspect-square w-[60px] shrink-0 overflow-hidden rounded-[12px] bg-sable sm:w-[84px] sm:rounded-[16px] lg:w-[clamp(96px,8vw,124px)]">
                <Image src="/images/brume/pommette.jpg" alt="" fill sizes="120px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="hidden flex-wrap gap-1.5 xl:flex">
                  <span className="rounded-full border border-prune/25 px-2.5 py-1 font-display text-[0.7rem] leading-none lg:text-[0.75rem]">Le plus réservé</span>
                  <span className="rounded-full border border-prune/25 px-2.5 py-1 font-display text-[0.7rem] leading-none lg:text-[0.75rem]">Soin visage</span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-[0.9rem] leading-tight tracking-[-0.02em] sm:text-[1.05rem] lg:text-[1.3rem]">
                    <Link href={`/soins/${featured.slug}`} className="after:absolute after:inset-0 hover:underline hover:decoration-prune/40 hover:underline-offset-4">
                      {featured.nom}
                    </Link>
                  </h2>
                  <p className="mt-0.5 hidden truncate text-[0.85rem] text-prune-soft xl:block">
                    Acide hyaluronique · masque occlusif · {formatDuree(featured.duree)}
                  </p>
                  <p className="mt-0.5 font-serif text-[0.95rem] leading-none sm:text-[1.2rem] lg:mt-1 lg:text-[1.45rem]">{formatPrix(featured.prix)}</p>
                </div>
              </div>
              <Link
                href={`/reserver?soin=${featured.slug}`}
                aria-label={`Réserver le soin ${featured.nom}`}
                className="relative z-10 grid size-8 shrink-0 place-items-center self-start rounded-full bg-ecume text-prune shadow-[var(--shadow-veil)] transition-[transform,background-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:rotate-90 hover:bg-prune hover:text-lait sm:size-10"
              >
                <Icon name="plus" size={18} />
              </Link>
            </div>
          </article>
        </div>
      </div>

      {/* Bas gauche : horaires + entrée vers le quiz (desktop) */}
      <div className={cn(s.aside, "absolute bottom-[6%] left-[calc(var(--spacing-gutter)+1rem)] z-30 hidden max-w-[20rem] xl:block")}>
        <p className="text-[0.95rem] leading-relaxed text-prune-soft">
          Sur rendez-vous, du mardi au samedi. Nocturne le jeudi jusqu&apos;à 20&nbsp;h&nbsp;30. {site.address.street}.
        </p>
        <Link
          href="#rituel"
          className="group mt-5 inline-flex min-h-12 items-center gap-3 rounded-full border border-prune/35 py-1.5 pl-5 pr-1.5 font-display text-[0.9rem] transition-colors duration-[var(--dur-2)] hover:border-prune hover:bg-prune hover:text-lait"
        >
          Votre rituel en 4 questions
          <span className="grid size-9 place-items-center rounded-full bg-prune text-lait transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:translate-y-0.5 group-hover:bg-lait group-hover:text-prune">
            <Icon name="fleche-bas" size={16} />
          </span>
        </Link>
      </div>

      {tilt === "ask" ? (
        <button
          type="button"
          onClick={askTilt}
          className="absolute bottom-4 right-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full bg-ecume/90 px-4 font-display text-[0.8rem] shadow-[var(--shadow-veil)] backdrop-blur md:hidden"
        >
          <Icon name="inclinaison" size={18} />
          Inclinez pour jouer avec la goutte
        </button>
      ) : null}
    </section>
  );
}

/** Goutte statique (fallback sans WebGL / mouvement réduit / appareil faible). */
function DropSvg() {
  return (
    <svg viewBox="0 0 100 130" className="block size-full overflow-visible">
      <defs>
        <radialGradient id="dropBody" cx="38%" cy="62%" r="70%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#E3E9E1" stopOpacity="0.35" />
          <stop offset="1" stopColor="#9CAF9A" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="dropRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D4A78F" stopOpacity="0.6" />
        </linearGradient>
        <filter id="dropShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="54" cy="126" rx="26" ry="4" fill="#221B1D" opacity="0.12" filter="url(#dropShadow)" />
      <path d="M50 4C66 26 88 50 88 78a38 38 0 1 1-76 0C12 50 34 26 50 4Z" fill="url(#dropBody)" stroke="url(#dropRim)" strokeWidth="1.2" />
      <path d="M30 76c1.5 11 8.5 19 19 21" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <ellipse cx="64" cy="58" rx="5" ry="9" fill="#fff" opacity="0.7" transform="rotate(-24 64 58)" />
    </svg>
  );
}
