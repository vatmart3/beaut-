"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode } from "react";
import { categories, soins, prixDepart, formatPrix, type CategorieId } from "@/data/soins";
import { Matiere } from "@/components/ui/Matiere";
import { Icon } from "@/components/icons/Icon";
import { LineReveal } from "@/components/effects/LineReveal";
import { ease } from "@/lib/motion";
import { useCoarsePointer, useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

const info = (id: CategorieId) => {
  const list = soins.filter((s) => s.categorie === id);
  const c = categories.find((x) => x.id === id)!;
  return { label: c.label, nombre: list.length, depuis: Math.min(...list.map(prixDepart)) };
};

/** Tuile photo : révélation au clip-path, légère inclinaison 3D qui suit la souris. */
function Tile({ href, className, children, visual, delay = 0, dark = false }: { href: string; className?: string; children: ReactNode; visual: ReactNode; delay?: number; dark?: boolean }) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const tilt = !reduced && !coarse;

  return (
    <motion.div
      className={cn("[perspective:1200px]", className)}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60, clipPath: "inset(12% 6% 0% 6% round 28px)" }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 28px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, delay, ease: ease.veil }}
    >
      <motion.div
        style={{ rotateX: srx, rotateY: sry }}
        onPointerMove={(e) => {
          if (!tilt) return;
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        className="h-full [transform-style:preserve-3d]"
      >
        <Link
          href={href}
          className={cn(
            "group relative block h-full min-h-[240px] overflow-hidden rounded-[28px]",
            dark ? "bg-prune text-lait" : "bg-sable",
          )}
        >
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-veil)] group-hover:scale-[1.06]">{visual}</div>
          {children}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function Glass({ label, nombre, depuis, className }: { label: string; nombre: number; depuis: number; className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-[20px] border border-white/60 bg-white/60 p-4 backdrop-blur-xl transition-transform duration-[var(--dur-4)] ease-[var(--ease-veil)] [transform:translateZ(40px)] group-hover:-translate-y-1 sm:inset-x-4 sm:bottom-4 sm:p-5",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-display text-[clamp(1.2rem,1rem+0.8vw,1.75rem)] leading-tight tracking-[-0.03em]">{label}</p>
        <p className="mt-0.5 text-[0.85rem] text-prune-soft">
          {nombre} soin{nombre > 1 ? "s" : ""} · dès <span className="font-serif text-prune">{formatPrix(depuis)}</span>
        </p>
      </div>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-prune text-lait transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover:rotate-[-35deg]">
        <Icon name="fleche" size={18} />
      </span>
    </div>
  );
}

export function Bento() {
  const v = info("visage");
  const c = info("corps");
  const m = info("mains-pieds");
  const e = info("epilations");
  const d = info("duo");
  return (
    <section aria-labelledby="bento-title" className="shell px-3 pb-3 pt-16 sm:px-4 sm:pb-4 lg:pt-24">
      <div className="flex flex-col gap-6 px-2 pb-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-14">
        <div>
          <p className="eyebrow text-argile-deep">La carte</p>
          <LineReveal
            as="h2"
            id="bento-title"
            text="Choisissez par où commencer."
            className="mt-4 max-w-[14ch] font-display text-[clamp(2.4rem,1.2rem+4vw,5.5rem)] font-light leading-[0.95] tracking-[-0.05em]"
          />
        </div>
        <p className="max-w-[36ch] text-lead text-prune-soft">17 soins, tous faits à la main, avec leur déroulé minute par minute et leur prix affiché.</p>
      </div>

      <div className="grid auto-rows-[minmax(240px,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[300px]">
        <Tile
          href="/soins?categorie=visage"
          className="sm:col-span-2 lg:row-span-2"
          visual={<Image src="/images/brume/visage.jpg" alt="Soin visage à Balaruc-les-Bains, teint lumineux" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-[50%_30%]" />}
        >
          <Glass {...v} />
        </Tile>
        <Tile
          href="/soins?categorie=corps"
          className="sm:col-span-2"
          delay={0.08}
          visual={<Image src="/images/brume/epaules.jpg" alt="Soin corps et modelage, épaules détendues" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />}
        >
          <Glass {...c} />
        </Tile>
        <Tile href="/soins?categorie=epilations" delay={0.16} visual={<Image src="/images/brume/pommette.jpg" alt="Peau nette après épilation à la cire tiède" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />}>
          <Glass {...e} />
        </Tile>
        <Tile href="/soins?categorie=mains-pieds" delay={0.24} visual={<Matiere kind="huile" className="size-full" />}>
          <Glass {...m} />
        </Tile>
        <Tile href="/soins?categorie=duo" className="sm:col-span-2 lg:col-span-3" delay={0.1} visual={<Image src="/images/brume/nude.jpg" alt="" fill sizes="75vw" className="object-cover" />}>
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
            <p className="max-w-[18ch] font-display text-[clamp(2rem,1rem+3vw,4rem)] font-light leading-[0.98] tracking-[-0.045em]">La cabine duo, pour vivre le même soin au même moment.</p>
          </div>
          <Glass {...d} className="sm:left-auto sm:w-[360px]" />
        </Tile>
        <Tile href="/soins" dark delay={0.18} visual={<div className="size-full bg-[radial-gradient(90%_70%_at_70%_20%,#4a3a3e,#221B1D)]" />}>
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
            <p className="font-serif text-[4rem] leading-none">{soins.length}</p>
            <p className="flex items-center justify-between font-display text-[1.35rem] tracking-[-0.02em]">
              Toute la carte
              <span className="grid size-11 place-items-center rounded-full bg-lait text-prune transition-transform duration-[var(--dur-3)] group-hover:translate-x-1">
                <Icon name="fleche" size={18} />
              </span>
            </p>
          </div>
        </Tile>
      </div>
    </section>
  );
}
