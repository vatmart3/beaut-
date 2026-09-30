"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { nav, site, mapsUrl } from "@/config/site";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/device";
import { Icon } from "@/components/icons/Icon";
import { hoursShort } from "@/lib/hours";

/** Formes, teintes et décalages de chaque galet — composition « posée à la main ». */
const galets = [
  { shape: "58% 42% 55% 45% / 52% 58% 42% 48%", tone: "bg-[radial-gradient(120%_90%_at_30%_20%,#FFFFFF,#EFE6DF_60%,#d6c6b4)]", w: "w-[min(82vw,360px)] lg:w-[380px]", h: "h-[100px] lg:h-[170px]", dy: 0, rot: -3 },
  { shape: "46% 54% 42% 58% / 55% 45% 55% 45%", tone: "bg-[radial-gradient(120%_90%_at_30%_20%,#f4f7f2,#c9d4c6_60%,#9caf9a)]", w: "w-[min(70vw,300px)] lg:w-[300px]", h: "h-[92px] lg:h-[140px]", dy: 40, rot: 4 },
  { shape: "52% 48% 60% 40% / 45% 55% 45% 55%", tone: "bg-[radial-gradient(120%_90%_at_30%_20%,#fbf1ea,#e6cfbf_60%,#D4A78F)]", w: "w-[min(76vw,320px)] lg:w-[330px]", h: "h-[96px] lg:h-[150px]", dy: -10, rot: -2 },
  { shape: "60% 40% 48% 52% / 50% 50% 50% 50%", tone: "bg-[radial-gradient(120%_90%_at_30%_20%,#FFFFFF,#efe7dd_60%,#ddd0c0)]", w: "w-[min(66vw,280px)] lg:w-[280px]", h: "h-[90px] lg:h-[128px]", dy: 20, rot: 3 },
  { shape: "44% 56% 52% 48% / 58% 42% 58% 42%", tone: "bg-[radial-gradient(120%_90%_at_30%_20%,#f4f7f2,#dbe3d8_60%,#b8c6b5)]", w: "w-[min(60vw,250px)] lg:w-[250px]", h: "h-[88px] lg:h-[118px]", dy: -24, rot: -4 },
  { shape: "55% 45% 40% 60% / 48% 52% 48% 52%", tone: "bg-[radial-gradient(120%_90%_at_30%_20%,#fbf6f1,#efe2d8_60%,#dcc2ae)]", w: "w-[min(58vw,240px)] lg:w-[240px]", h: "h-[86px] lg:h-[112px]", dy: 30, rot: 2 },
  { shape: "50% 50% 56% 44% / 54% 46% 54% 46%", tone: "bg-[radial-gradient(120%_90%_at_30%_20%,#6a5560,#221B1D_55%,#000000)] text-lait", w: "w-[min(72vw,300px)] lg:w-[320px]", h: "h-[104px] lg:h-[140px]", dy: 6, rot: -1 },
];

export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("a,button")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !ref.current) return;
      const f = Array.from(ref.current.querySelectorAll<HTMLElement>("a,button"));
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={ref}
          id="menu-galets"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] overflow-y-auto bg-lait"
          data-lenis-prevent
          initial={reduced ? { opacity: 0 } : { clipPath: "circle(0% at 8% 5%)" }}
          animate={reduced ? { opacity: 1 } : { clipPath: "circle(150% at 8% 5%)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: "circle(0% at 8% 5%)", transition: { duration: 0.6, ease: ease.tide } }}
          transition={{ duration: 0.9, ease: ease.tide }}
        >
          {/* Surface d'eau : ondes concentriques très pâles */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 700">
            {[80, 160, 250, 350, 460, 580].map((r, i) => (
              <motion.ellipse
                key={r}
                cx="500"
                cy="380"
                rx={r}
                ry={r * 0.38}
                fill="none"
                stroke="#D4A78F"
                strokeOpacity={0.28 - i * 0.035}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.8, delay: 0.3 + i * 0.08, ease: ease.veil }}
                style={{ transformOrigin: "500px 380px" }}
              />
            ))}
          </svg>

          <div className="frame relative flex min-h-full flex-col pb-10 pt-4 sm:pt-7">
            <div className="flex items-center justify-between gap-4 px-1 sm:px-[calc(var(--spacing-gutter)+0.5rem)]">
              <Link href="/" onClick={onClose} className="inline-flex min-h-11 items-center font-display text-[1.05rem] font-medium tracking-[0.18em]">
                BRUME
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-prune/35 px-5 font-display text-[0.875rem] hover:border-prune hover:bg-prune hover:text-lait"
              >
                <Icon name="fermer" size={16} />
                Fermer
              </button>
            </div>

            <nav aria-label="Rubriques" className="my-auto py-10">
              <ul className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:gap-x-8 lg:gap-y-2">
                {nav.map((item, i) => {
                  const g = galets[i % galets.length];
                  return (
                    <motion.li
                      key={item.href}
                      className="relative lg:mt-[var(--dy)]"
                      style={{ ["--dy" as string]: `${g.dy}px` }}
                      initial={reduced ? { opacity: 0 } : { y: -120, opacity: 0, rotate: g.rot * 3 }}
                      animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, rotate: g.rot }}
                      transition={
                        reduced
                          ? { duration: 0.3 }
                          : { type: "spring", stiffness: 140, damping: 16, mass: 0.9, delay: 0.25 + i * 0.07 }
                      }
                    >
                      {/* onde sous le galet, au moment où il se pose */}
                      {reduced ? null : (
                        <motion.span
                          aria-hidden
                          className="absolute inset-x-[8%] -bottom-3 h-6 rounded-[50%] border border-argile/60"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: [0.4, 1.35], opacity: [0.9, 0] }}
                          transition={{ duration: 1.1, delay: 0.55 + i * 0.07, ease: ease.veil }}
                        />
                      )}
                      <Link
                        href={item.href}
                        onClick={onClose}
                        style={{ borderRadius: g.shape }}
                        className={cn(
                          "group relative flex flex-col items-center justify-center px-8 text-center shadow-[var(--shadow-galet)] transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
                          g.tone,
                          g.w,
                          g.h,
                        )}
                      >
                        <span className="font-display text-[1.35rem] leading-tight tracking-[-0.03em] lg:text-[1.9rem]">{item.label}</span>
                        <span className={cn("mt-1 text-[0.8rem]", i === nav.length - 1 ? "text-lait/80" : "text-prune-soft")}>{item.hint}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              className="grid gap-6 border-t hairline pt-6 text-[0.95rem] sm:grid-cols-3 sm:px-[calc(var(--spacing-gutter)+0.5rem)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div>
                <p className="eyebrow text-prune-mute">Adresse</p>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline decoration-prune/25 underline-offset-4 hover:decoration-prune">
                  {site.address.street}, {site.address.postalCode} {site.address.city}
                </a>
              </div>
              <div>
                <p className="eyebrow text-prune-mute">Téléphone</p>
                <a href={site.contact.phoneHref} className="mt-2 inline-block underline decoration-prune/25 underline-offset-4 hover:decoration-prune">
                  {site.contact.phone}
                </a>
              </div>
              <div>
                <p className="eyebrow text-prune-mute">Horaires</p>
                <p className="mt-2">{hoursShort()}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
