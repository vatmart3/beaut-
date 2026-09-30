import { praticiennes } from "@/data/praticiennes";
import { RippleReveal, Counter } from "@/components/effects/Reveal";
import { LineReveal } from "@/components/effects/LineReveal";
import { cn } from "@/lib/cn";

/**
 * Les praticiennes — portraits art-dirigés (placeholders : galet texturé et
 * monogramme) révélés par ondulation. À remplacer par de vraies photos.
 */
export function Praticiennes() {
  const year = new Date().getFullYear();
  return (
    <section aria-labelledby="praticiennes-title" className="shell relative overflow-hidden px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-12">
        <p className="eyebrow text-argile-deep lg:col-span-3">Les mains</p>
        <LineReveal
          as="h2"
          id="praticiennes-title"
          text="Deux praticiennes, et c'est tout. Vous savez toujours qui vous reçoit."
          className="font-display text-[clamp(2rem,1.1rem+3vw,4.25rem)] font-light leading-[1.02] tracking-[-0.04em] lg:col-span-9"
        />
      </div>

      <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-8">
        {praticiennes.map((p, i) => (
          <article key={p.id} className={cn("grid gap-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:col-span-6", i === 1 && "lg:mt-32")}>
            <RippleReveal delay={0.1 * i}>
              <div
                className={cn(
                  "grain relative grid aspect-[4/5] place-items-center overflow-hidden",
                  p.teinte === "argile" ? "bg-[radial-gradient(120%_90%_at_30%_20%,#f6e9df,#D4A78F_70%,#a9806a)]" : "bg-[radial-gradient(120%_90%_at_30%_20%,#eef2ec,#9caf9a_70%,#7f917c)]",
                )}
                style={{ borderRadius: i === 0 ? "46% 54% 44% 56% / 38% 40% 60% 62%" : "54% 46% 58% 42% / 40% 38% 62% 60%" }}
                role="img"
                aria-label={`Portrait à venir de ${p.prenom} ${p.nom}, ${p.role.toLowerCase()} à l'institut BRUME, Balaruc-les-Bains`}
              >
                <span className="relative z-[2] font-serif text-[clamp(5rem,3rem+6vw,9rem)] leading-none text-lait/90">
                  {p.prenom[0]}
                  {p.nom[0]}
                </span>
              </div>
            </RippleReveal>
            <div className="flex flex-col">
              <h3 className="font-display text-[2rem] font-light leading-none tracking-[-0.035em]">
                {p.prenom} <span className="text-prune-soft">{p.nom}</span>
              </h3>
              <p className="mt-2 text-[0.95rem] text-argile-deep">{p.role}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <Counter to={year - p.depuis} className="font-serif text-[3.25rem] leading-none" />
                <span className="text-[0.95rem] text-prune-soft">ans de métier</span>
              </p>
              <blockquote className="mt-6 border-l-2 border-argile pl-4 font-display text-[1.3rem] font-light leading-snug tracking-[-0.02em]">«&nbsp;{p.mot}&nbsp;»</blockquote>
              <ul className="mt-6 space-y-1.5 text-[0.9rem] text-prune-soft">
                {p.formation.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <p className="mt-5 flex flex-wrap gap-1.5">
                {p.specialites.map((s) => (
                  <span key={s} className="rounded-full border border-prune/20 px-3 py-1.5 font-display text-[0.8rem]">
                    {s}
                  </span>
                ))}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
