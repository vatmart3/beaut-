"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { site } from "@/config/site";
import { MenuOverlay } from "./MenuOverlay";
import { useLenis } from "./SmoothScroll";

const pill =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 font-display text-[0.875rem] leading-none tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-veil)]";

/**
 * En-tête en pastilles, comme la référence : quatre pills fines réparties
 * sur la largeur. Au scroll, il se condense en une barre flottante.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    let last = window.scrollY;
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden((h) => (y > 400 && y > last + 4 ? true : y < last - 4 ? false : h));
      last = y;
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const showLogo = !isHome || scrolled;

  return (
    <>
      <a
        href="#contenu"
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-prune px-5 py-3 font-display text-sm text-lait focus:translate-y-0"
      >
        Aller au contenu
      </a>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden && !open ? "-120%" : "0%" }}
        transition={{ duration: 0.5, ease: ease.veil }}
      >
        <div className="frame pt-3 sm:pt-4">
          <nav
            aria-label="Navigation principale"
            className={cn(
              "mx-auto flex items-center justify-between gap-3 rounded-full px-3 py-2.5 transition-[background-color,box-shadow,max-width,padding] duration-[var(--dur-4)] ease-[var(--ease-veil)] sm:px-5 sm:py-3",
              scrolled ? "max-w-[980px] bg-ecume/85 shadow-[var(--shadow-float)] backdrop-blur-md" : "max-w-full bg-transparent sm:px-[calc(var(--spacing-gutter)+0.5rem)] sm:pt-6",
            )}
          >
            <div className="flex items-center gap-2 lg:w-1/4">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-controls="menu-galets"
                className={cn(pill, "border-prune/35 text-prune hover:border-prune hover:bg-prune hover:text-lait")}
              >
                <span aria-hidden className="flex gap-[3px]">
                  <span className="size-[7px] rounded-[55%_45%_50%_50%] bg-current" />
                  <span className="size-[7px] rounded-[45%_55%_50%_50%] bg-current opacity-60" />
                </span>
                Menu
              </button>
              <AnimatePresence initial={false}>
                {showLogo ? (
                  <motion.span
                    key="logo"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.4, ease: ease.veil }}
                  >
                    <Link
                      href="/"
                      className="ml-1 inline-flex min-h-11 items-center px-2 font-display text-[1.05rem] font-medium tracking-[0.18em] text-prune"
                      aria-label={`${site.name}, retour à l'accueil`}
                    >
                      BRUME
                    </Link>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="hidden items-center gap-3 md:flex lg:w-1/2 lg:justify-around">
              <Link href="/soins" className={cn(pill, "border-prune/35 text-prune hover:border-prune hover:bg-prune hover:text-lait", pathname.startsWith("/soins") && "border-prune")}>
                Soins visage & corps
              </Link>
              <Link
                href="/bons-cadeaux"
                className={cn(pill, "border-prune/35 text-prune hover:border-prune hover:bg-prune hover:text-lait", pathname.startsWith("/bons-cadeaux") && "border-prune")}
              >
                Bons cadeaux
              </Link>
            </div>

            <div className="flex items-center justify-end gap-2 lg:w-1/4">
              <a
                href={site.contact.phoneHref}
                className="hidden min-h-11 items-center rounded-full border border-transparent px-4 font-display text-[0.875rem] text-prune transition-colors duration-[var(--dur-2)] hover:border-prune/35 xl:inline-flex"
              >
                {site.contact.phone}
              </a>
              <Link href="/reserver" className={cn(pill, "border-prune bg-prune text-lait hover:bg-[#2c1f26]")}>
                Réserver
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>
      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
