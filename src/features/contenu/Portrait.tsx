import { useId } from "react";
import { cn } from "@/lib/cn";

const teintes = {
  argile: ["#F1E2D6", "#C9A48A", "#94705A"],
  sauge: ["#EEF2EC", "#9CAF9A", "#66796A"],
} as const;

/**
 * Portrait art-dirigé (placeholder) : un galet texturé, éclairé en
 * lumière rasante, frappé du monogramme en Gloock. À remplacer par une
 * vraie photo le jour venu — la silhouette galet peut servir de masque.
 */
export function Portrait({
  initiale,
  teinte,
  className,
  size = "lg",
  label,
}: {
  initiale: string;
  teinte: keyof typeof teintes;
  className?: string;
  size?: "sm" | "lg";
  label?: string;
}) {
  const id = useId().replace(/:/g, "");
  const [a, b, c] = teintes[teinte];
  return (
    <div className={cn("relative aspect-[5/6]", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 300 360" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id={`g${id}`} cx="0.36" cy="0.3" r="0.85">
            <stop offset="0" stopColor={a} />
            <stop offset="0.55" stopColor={b} />
            <stop offset="1" stopColor={c} />
          </radialGradient>
          <filter id={`t${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={size === "sm" ? 0.05 : 0.022} numOctaves="4" seed="8" result="n" />
            <feDiffuseLighting in="n" surfaceScale="2.4" lightingColor="#FFF8F1" result="l">
              <feDistantLight azimuth="225" elevation="52" />
            </feDiffuseLighting>
            <feComposite in="l" in2="SourceGraphic" operator="in" />
          </filter>
          <filter id={`s${id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <clipPath id={`c${id}`}>
            <path d="M150 18c78 0 128 62 128 150 0 104-58 174-134 174C66 342 22 270 22 176 22 84 72 18 150 18Z" />
          </clipPath>
        </defs>
        <ellipse cx="150" cy="346" rx="104" ry="12" fill="#3B2A33" opacity="0.22" filter={`url(#s${id})`} />
        <g clipPath={`url(#c${id})`}>
          <rect width="300" height="360" fill={`url(#g${id})`} />
          <rect width="300" height="360" fill={b} filter={`url(#t${id})`} opacity="0.42" style={{ mixBlendMode: "multiply" }} />
          <ellipse cx="108" cy="92" rx="70" ry="44" fill="#fff" opacity="0.28" transform="rotate(-24 108 92)" />
          <path d="M40 250c60 40 160 50 240 0v120H40Z" fill="#3B2A33" opacity="0.08" />
        </g>
      </svg>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 grid place-items-center pb-[6%] font-serif leading-none text-ecume/95 [text-shadow:0_1px_0_rgb(59_42_51/0.18),0_-1px_0_rgb(255_255_255/0.35)]",
          size === "sm" ? "text-[1.6rem]" : "text-[clamp(5rem,3rem+6vw,9rem)]",
        )}
      >
        {initiale}
      </span>
    </div>
  );
}
