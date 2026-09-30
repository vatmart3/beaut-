"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/device";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

/** Sommaire ancré : l'article en cours de lecture est souligné d'une goutte. */
export function CgvToc({ items }: { items: { id: string; title: string }[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sommaire des conditions" className="lg:sticky lg:top-28">
      <p className="eyebrow text-argile-deep">Sommaire</p>
      <motion.ol
        className="mt-5 grid gap-0.5 text-[0.95rem]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: reduced ? 0 : 0.035 }}
      >
        {items.map((it, i) => (
          <motion.li
            key={it.id}
            variants={{ hidden: { opacity: 0, x: reduced ? 0 : -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: ease.veil } } }}
          >
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "location" : undefined}
              className={cn(
                "group flex min-h-10 items-center gap-3 rounded-full py-1.5 pr-3 transition-colors duration-[var(--dur-2)]",
                active === it.id ? "text-prune" : "text-prune-mute hover:text-prune",
              )}
            >
              <span className="w-6 shrink-0 font-serif text-[0.85rem] tabular">{String(i + 1).padStart(2, "0")}</span>
              <span
                aria-hidden
                className={cn(
                  "h-px shrink-0 bg-current transition-[width] duration-[var(--dur-3)] ease-[var(--ease-veil)]",
                  active === it.id ? "w-6" : "w-2 group-hover:w-4",
                )}
              />
              <span>{it.title}</span>
            </a>
          </motion.li>
        ))}
      </motion.ol>
    </nav>
  );
}
