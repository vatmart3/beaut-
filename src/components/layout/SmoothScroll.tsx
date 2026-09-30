"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/device";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * Smooth scroll Lenis synchronisé avec GSAP ScrollTrigger.
 * Désactivé si `prefers-reduced-motion`.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (reduced) return;
    const l = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, touchMultiplier: 1.4 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const id = requestAnimationFrame(() => setLenis(l));
    return () => {
      cancelAnimationFrame(id);
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
    };
  }, [reduced]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
