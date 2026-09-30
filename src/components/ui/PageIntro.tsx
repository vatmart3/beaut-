import type { ReactNode } from "react";
import { LineReveal } from "@/components/effects/LineReveal";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * En-tête des pages internes : coquille arrondie, fil d'Ariane, grand titre
 * éditorial (h1) qui monte sous masque, chapô décalé à droite (asymétrie).
 */
export function PageIntro({
  eyebrow,
  title,
  lead,
  crumbs,
  aside,
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  crumbs: { name: string; path: string }[];
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("shell relative overflow-hidden px-5 pb-14 pt-32 sm:px-10 sm:pt-40 lg:px-16 lg:pb-20", className)}>
      <Breadcrumbs items={crumbs} />
      <p className="eyebrow mt-10 text-argile-deep">{eyebrow}</p>
      <LineReveal as="h1" text={title} className="mt-4 max-w-[16ch] font-display text-[clamp(2.75rem,1.2rem+6.2vw,8.5rem)] font-light leading-[0.95] tracking-[-0.045em]" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {lead ? <div className="text-lead text-prune-soft lg:col-span-5 lg:col-start-7">{lead}</div> : null}
        {aside ? <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">{aside}</div> : null}
      </div>
    </section>
  );
}
