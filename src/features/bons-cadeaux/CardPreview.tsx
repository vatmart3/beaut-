"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { use3DCapable, useCoarsePointer, useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { CARD_W, cardFonts, drawBack, drawFront, loadCardFonts, type CardData } from "./cardArt";

const CardScene = dynamic(() => import("./CardScene"), { ssr: false });

/** Si la scène WebGL échoue (contexte refusé, pilote), on retombe sur la carte CSS. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const side = (turns: number) => ((turns % 2) + 2) % 2;

/**
 * Fallback sans WebGL (ou mouvement réduit, ou appareil modeste) :
 * la même carte, dessinée sur deux canvas, retournée en CSS 3D.
 */
function CardFallback({ data, turns, onTurns, landing }: { data: CardData; turns: number; onTurns: (n: number) => void; landing: boolean }) {
  const reduced = useReducedMotion();
  const front = useRef<HTMLCanvasElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const [fontsKey, setFontsKey] = useState(0);

  useEffect(() => {
    let alive = true;
    loadCardFonts().then(() => {
      if (alive) setFontsKey(1);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const f = cardFonts();
    const draw = (c: HTMLCanvasElement | null, fn: typeof drawFront) => {
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, Math.round(c.clientWidth * dpr));
      if (c.width !== w) {
        c.width = w;
        c.height = Math.round(w / 1.6);
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const k = c.width / CARD_W;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      fn(ctx, data, f);
    };
    draw(front.current, drawFront);
    draw(back.current, drawBack);
  }, [data, fontsKey]);

  const s = side(turns);
  const face = "absolute inset-0 size-full rounded-[5%/8%] [backface-visibility:hidden] shadow-[var(--shadow-float)]";

  return (
    <div className="absolute inset-0 grid place-items-center [perspective:1600px]">
      <motion.div
        className="relative w-[84%]"
        initial={landing && !reduced ? { y: -40, rotateX: 38, opacity: 0 } : false}
        animate={{ y: 0, rotateX: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: ease.veil }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => onTurns(turns + 1)}
          className="relative block aspect-[1.6] w-full cursor-pointer transition-transform duration-[900ms] ease-[var(--ease-veil)] [transform-style:preserve-3d] hover:[--tilt:-2deg]"
          style={{ transform: reduced ? undefined : `rotateY(${turns * 180}deg) rotateX(var(--tilt, 0deg))` }}
        >
          <canvas
            ref={front}
            className={cn(face, reduced && "transition-opacity duration-500")}
            style={reduced ? { opacity: s === 0 ? 1 : 0 } : undefined}
          />
          <canvas
            ref={back}
            className={cn(face, reduced ? "transition-opacity duration-500" : "[transform:rotateY(180deg)]")}
            style={reduced ? { opacity: s === 1 ? 1 : 0 } : undefined}
          />
        </button>
        <div aria-hidden className="pointer-events-none absolute -bottom-[16%] left-[10%] h-[12%] w-[80%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(59_42_51/0.22),transparent)]" />
      </motion.div>
    </div>
  );
}

/**
 * Aperçu de la carte : 3D si possible (chargée à la demande), sinon CSS 3D.
 * Le visuel est décoratif pour les lecteurs d'écran : `description` en donne
 * l'équivalent textuel complet.
 */
export function CardPreview({
  data,
  description,
  landing = false,
  className,
}: {
  data: CardData;
  description: string;
  landing?: boolean;
  className?: string;
}) {
  const capable = use3DCapable();
  const [failed, setFailed] = useState(false);
  const can3D = capable && !failed;
  const onError = useCallback(() => setFailed(true), []);
  const coarse = useCoarsePointer();
  const [turns, setTurns] = useState(0);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const s = side(turns);

  return (
    <div className={className}>
      <p className="sr-only">{description}</p>
      <div aria-hidden className="relative aspect-[5/4] w-full">
        {!can3D || !ready ? <CardFallback data={data} turns={turns} onTurns={setTurns} landing={landing} /> : null}
        {can3D ? (
          <SceneBoundary onError={onError}>
            <Suspense fallback={null}>
              <div className={cn("absolute inset-0 transition-opacity duration-700 ease-[var(--ease-veil)]", ready ? "opacity-100" : "opacity-0")}>
                <CardScene data={data} turns={turns} onTurns={setTurns} landing={landing} onReady={onReady} />
              </div>
            </Suspense>
          </SceneBoundary>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => setTurns((t) => t + 1)}
          className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-prune/25 bg-ecume px-5 font-display text-[0.9rem] text-prune transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune hover:bg-prune hover:text-lait active:scale-[0.98]"
        >
          <Icon name="retourner" size={18} className="transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:rotate-180" />
          Retourner la carte
          <span className="sr-only">{s === 0 ? "(afficher le verso)" : "(afficher le recto)"}</span>
        </button>
        <p className="flex items-center gap-2 text-caption text-prune-mute">
          <span className="inline-flex gap-1" aria-hidden>
            <span className={cn("size-1.5 rounded-full transition-colors", s === 0 ? "bg-prune" : "bg-prune/20")} />
            <span className={cn("size-1.5 rounded-full transition-colors", s === 1 ? "bg-prune" : "bg-prune/20")} />
          </span>
          <span aria-live="polite">{s === 0 ? "Recto" : "Verso"}</span>
          {can3D && ready ? <span aria-hidden>· {coarse ? "glissez du doigt pour la faire pivoter" : "ou faites-la glisser"}</span> : null}
        </p>
      </div>
    </div>
  );
}
