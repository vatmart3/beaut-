import { LineReveal } from "@/components/effects/LineReveal";
import { cn } from "@/lib/cn";

/** Sur-titre + h2 éditorial qui monte sous masque. */
export function SectionTitle({
  eyebrow,
  title,
  className,
  size = "lg",
}: {
  eyebrow?: string;
  title: string;
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={className}>
      {eyebrow ? <p className="eyebrow text-argile-deep">{eyebrow}</p> : null}
      <LineReveal
        as="h2"
        text={title}
        className={cn(
          "font-display font-light tracking-[-0.04em]",
          eyebrow && "mt-3",
          size === "lg" ? "text-[clamp(2.1rem,1.2rem+3.4vw,4.75rem)] leading-[0.98]" : "text-title",
        )}
      />
    </div>
  );
}
