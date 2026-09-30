import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const pill =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-prune/35 px-4 font-display text-[0.8125rem] leading-none tracking-[-0.005em] text-prune transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)]";

/** Pastille fine, comme dans la référence : filet prune, fond transparent. */
export function Pill({ children, className, tone = "line" }: { children: ReactNode; className?: string; tone?: "line" | "lait" | "fill" }) {
  return (
    <span
      className={cn(
        pill,
        tone === "lait" && "border-prune/15 bg-lait/80",
        tone === "fill" && "border-prune bg-prune text-lait",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PillLink({ href, children, className, active }: { href: string; children: ReactNode; className?: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(pill, "min-h-11 px-5 hover:border-prune hover:bg-prune hover:text-lait", active && "border-prune bg-prune text-lait", className)}
    >
      {children}
    </Link>
  );
}
