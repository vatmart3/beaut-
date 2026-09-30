"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";

export interface LegalSection {
  id: string;
  titre: string;
  contenu: ReactNode;
}

/** Mise en forme du texte juridique : lisible, aéré, listes et tableaux sobres. */
const body =
  "max-w-[68ch] text-prune-soft leading-relaxed [&_a]:text-prune [&_a]:underline [&_a]:decoration-prune/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-prune [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-[1.15rem] [&_h3]:text-prune [&_li]:mt-2 [&_li]:pl-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-prune [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-argile-deep";

/** Sommaire ancré (suivi de la section en cours) + sections numérotées. */
export function LegalLayout({ sections, maj }: { sections: LegalSection[]; maj: string }) {
  const [actif, setActif] = useState(sections[0]?.id);
  const reduced = useReducedMotion();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActif(vis.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  const toc = (
    <ol className="space-y-0.5">
      {sections.map((s, i) => {
        const on = actif === s.id;
        return (
          <li key={s.id} className="relative">
            {on ? (
              <motion.span
                layoutId="legal-toc"
                aria-hidden
                className="absolute inset-0 rounded-full bg-sable"
                transition={reduced ? { duration: 0 } : { duration: 0.5, ease: ease.veil }}
              />
            ) : null}
            <a
              href={`#${s.id}`}
              aria-current={on ? "location" : undefined}
              className={cn(
                "relative flex min-h-11 items-center gap-3 rounded-full px-4 py-2 text-[0.9rem] leading-snug transition-colors duration-[var(--dur-2)] ease-[var(--ease-veil)]",
                on ? "text-prune" : "text-prune-soft hover:text-prune",
              )}
            >
              <span className="tabular w-5 shrink-0 font-serif text-[0.8rem] text-prune-mute">{String(i + 1).padStart(2, "0")}</span>
              {s.titre}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4 xl:col-span-3">
        {/* Mobile : sommaire repliable */}
        <details className="group rounded-[var(--radius-card)] bg-voile lg:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 font-display [&::-webkit-details-marker]:hidden">
            Sommaire
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-ecume transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-open:rotate-45">
              <Icon name="plus" size={16} />
            </span>
          </summary>
          <nav aria-label="Sommaire" className="px-2 pb-4">
            {toc}
          </nav>
        </details>
        {/* Desktop : sommaire collant */}
        <nav aria-label="Sommaire" className="sticky top-28 hidden lg:block">
          <p className="eyebrow mb-3 px-4 text-prune-mute">Sommaire</p>
          {toc}
          <p className="mt-6 px-4 text-[0.8125rem] text-prune-mute">Dernière mise à jour : {maj}</p>
        </nav>
      </div>

      <div className="lg:col-span-8 lg:col-start-5 xl:col-span-8 xl:col-start-5">
        {sections.map((s, i) => (
          <motion.section
            key={s.id}
            id={s.id}
            aria-labelledby={`${s.id}-t`}
            className="scroll-mt-28 border-t hairline py-10 first:border-t-0 first:pt-0 lg:py-14"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: ease.veil }}
          >
            <p aria-hidden className="tabular font-serif text-[1rem] text-argile-deep">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 id={`${s.id}-t`} className="mt-1 font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] font-light leading-tight tracking-[-0.03em]">
              {s.titre}
            </h2>
            <div className={cn("mt-5", body)}>{s.contenu}</div>
          </motion.section>
        ))}
        <p className="mt-4 text-[0.8125rem] text-prune-mute lg:hidden">Dernière mise à jour : {maj}</p>
      </div>
    </div>
  );
}
