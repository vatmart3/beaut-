"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/device";

gsap.registerPlugin(ScrollTrigger);

const items: { t: string; img?: string }[] = [
  { t: "Soins visage", img: "/images/brume/regard.jpg" },
  { t: "Gommages au sel" },
  { t: "Modelages", img: "/images/brume/epaules.jpg" },
  { t: "Enveloppements à l'argile" },
  { t: "Rituels duo", img: "/images/brume/levres.jpg" },
  { t: "Beauté des mains" },
];

/**
 * Bandeau défilant infini ; sa vitesse et son sens suivent le scroll
 * (plus on défile vite, plus il file). Pastilles photo arrondies entre les mots.
 */
export function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = track.current;
    if (!el || reduced) return;
    let x = 0;
    let dir = 1;
    let boost = 0;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        dir = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 300, 12);
      },
    });
    const tick = (_t: number, dt: number) => {
      const half = el.scrollWidth / 2;
      x -= dir * (0.045 + boost * 0.02) * dt;
      boost *= 0.93;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [reduced]);

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {items.map((it) => (
        <span key={it.t} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-[clamp(2.75rem,1.5rem+5vw,7rem)] font-light leading-none tracking-[-0.05em] sm:px-10">
            {it.t}
          </span>
          {it.img ? (
            <span className="relative h-[clamp(3rem,2rem+3.4vw,5.5rem)] w-[clamp(6rem,4rem+7vw,11rem)] shrink-0 overflow-hidden rounded-full">
              <Image src={it.img} alt="" fill sizes="180px" className="object-cover" />
            </span>
          ) : (
            <span className="size-3 shrink-0 rounded-full bg-argile" />
          )}
        </span>
      ))}
    </div>
  );

  return (
    <section aria-label="Nos soins en un coup d'œil" className="shell overflow-hidden py-10 sm:py-14">
      <div ref={track} className="flex w-max will-change-transform">
        {row("a")}
        {row("b")}
      </div>
    </section>
  );
}
