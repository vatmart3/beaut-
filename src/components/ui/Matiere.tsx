import { Photo } from "./Photo";
import { useId } from "react";
import type { Matiere as MatiereId } from "@/data/soins";
import { cn } from "@/lib/cn";

/**
 * Visuels procéduraux « matières » : eau, argile, sel, lin, huile, galets.
 * Ce sont des SVG (filtres de turbulence) — légers, nets à toutes les tailles,
 * et uniques au site. `portrait` utilise la photo du hero recadrée.
 */
export function Matiere({
  kind,
  className,
  breathe = true,
  label,
  sizes = "(min-width: 1024px) 40vw, 90vw",
}: {
  kind: MatiereId;
  className?: string;
  breathe?: boolean;
  label?: string;
  sizes?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={cn("relative overflow-hidden bg-sable", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <div className={cn("absolute inset-0", breathe && "motion-safe:animate-breathe")}>
        {kind === "portrait" ? (
          <Photo id="visage" alt="" sizes={sizes} />
        ) : (
          <Svg kind={kind} id={id} />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[url(/textures/grain.svg)] bg-[length:220px] opacity-25 mix-blend-multiply" />
    </div>
  );
}

function Svg({ kind, id }: { kind: Exclude<MatiereId, "portrait">; id: string }) {
  const common = { width: "100%", height: "100%", viewBox: "0 0 400 500", preserveAspectRatio: "xMidYMid slice" as const, className: "block size-full" };
  switch (kind) {
    case "eau":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E3E9E1" />
              <stop offset="1" stopColor="#9CAF9A" />
            </linearGradient>
            <filter id={`f${id}`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="turbulence" baseFrequency="0.008 0.022" numOctaves="3" seed="7" result="t" />
              <feColorMatrix in="t" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.98  0 0 0 -2.2 1.35" />
            </filter>
          </defs>
          <rect width="400" height="500" fill={`url(#g${id})`} />
          <rect width="400" height="500" filter={`url(#f${id})`} opacity="0.55" />
          {[40, 80, 130, 190, 260].map((r, i) => (
            <ellipse key={r} cx="250" cy="330" rx={r} ry={r * 0.32} fill="none" stroke="#F8F5F2" strokeOpacity={0.5 - i * 0.08} strokeWidth="1" />
          ))}
        </svg>
      );
    case "argile":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`g${id}`} cx="0.3" cy="0.25" r="0.9">
              <stop offset="0" stopColor="#E4CBB8" />
              <stop offset="0.6" stopColor="#D4A78F" />
              <stop offset="1" stopColor="#A9806A" />
            </radialGradient>
            <filter id={`f${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="3" result="n" />
              <feDiffuseLighting in="n" surfaceScale="3.2" lightingColor="#F5E8DD" result="l">
                <feDistantLight azimuth="235" elevation="48" />
              </feDiffuseLighting>
              <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
            </filter>
          </defs>
          <rect width="400" height="500" fill={`url(#g${id})`} />
          <rect width="400" height="500" fill={`url(#g${id})`} filter={`url(#f${id})`} opacity="0.9" />
        </svg>
      );
    case "sel":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F4EEE6" />
              <stop offset="1" stopColor="#EFE6DF" />
            </linearGradient>
            <filter id={`f${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed="11" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -6.2" />
            </filter>
            <filter id={`s${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1" seed="5" />
              <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 8 -6" />
            </filter>
          </defs>
          <rect width="400" height="500" fill={`url(#g${id})`} />
          <rect width="400" height="500" filter={`url(#s${id})`} opacity="0.45" transform="translate(1.2 1.6)" />
          <rect width="400" height="500" filter={`url(#f${id})`} />
          <path d="M-20 390 C 90 350, 180 420, 420 360 L 420 520 L -20 520 Z" fill="#D4A78F" opacity="0.22" />
        </svg>
      );
    case "lin":
      return (
        <svg {...common}>
          <defs>
            <filter id={`f${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves="2" seed="2" result="v" />
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="9" result="h" />
              <feBlend in="v" in2="h" mode="multiply" result="b" />
              <feColorMatrix in="b" values="0 0 0 0 0.42  0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 -1.6 1.05" />
            </filter>
            <linearGradient id={`g${id}`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="#F3ECE3" />
              <stop offset="1" stopColor="#DCCFBF" />
            </linearGradient>
          </defs>
          <rect width="400" height="500" fill={`url(#g${id})`} />
          <rect width="400" height="500" filter={`url(#f${id})`} opacity="0.35" />
          <path d="M0 120 C 120 180, 260 60, 400 140 L400 160 C 260 90, 140 200, 0 150Z" fill="#fff" opacity="0.35" />
          <path d="M0 300 C 140 250, 250 360, 400 290 L400 310 C 250 380, 130 280, 0 330Z" fill="#221B1D" opacity="0.05" />
        </svg>
      );
    case "huile":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={`g${id}`} cx="0.65" cy="0.35" r="0.85">
              <stop offset="0" stopColor="#F6E3C9" />
              <stop offset="0.45" stopColor="#E3C29F" />
              <stop offset="1" stopColor="#B98B68" />
            </radialGradient>
            <radialGradient id={`h${id}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <filter id={`f${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.006 0.014" numOctaves="2" seed="21" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="60" />
            </filter>
          </defs>
          <rect width="400" height="500" fill={`url(#g${id})`} />
          <g filter={`url(#f${id})`}>
            <ellipse cx="170" cy="190" rx="120" ry="40" fill={`url(#h${id})`} opacity="0.7" />
            <ellipse cx="270" cy="340" rx="90" ry="26" fill={`url(#h${id})`} opacity="0.5" />
            <ellipse cx="110" cy="420" rx="70" ry="18" fill={`url(#h${id})`} opacity="0.45" />
          </g>
        </svg>
      );
    case "galets":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#EFE7DD" />
              <stop offset="1" stopColor="#E0D3C3" />
            </linearGradient>
            <radialGradient id={`p${id}`} cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.55" stopColor="#D9CBBB" />
              <stop offset="1" stopColor="#A89786" />
            </radialGradient>
            <radialGradient id={`q${id}`} cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#F1F4EF" />
              <stop offset="0.55" stopColor="#B8C6B5" />
              <stop offset="1" stopColor="#7F917C" />
            </radialGradient>
            <radialGradient id={`r${id}`} cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#6A5560" />
              <stop offset="1" stopColor="#2C1F26" />
            </radialGradient>
            <filter id={`sh${id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <rect width="400" height="500" fill={`url(#b${id})`} />
          <ellipse cx="205" cy="418" rx="130" ry="18" fill="#221B1D" opacity="0.22" filter={`url(#sh${id})`} />
          <path d="M80 392c0-34 58-56 124-56s118 20 118 50-54 44-122 44S80 420 80 392Z" fill={`url(#p${id})`} />
          <path d="M120 322c0-27 42-44 90-44s86 16 86 40-38 36-88 36-88-10-88-32Z" fill={`url(#q${id})`} />
          <path d="M156 262c0-20 28-33 60-33s56 12 56 30-25 27-58 27-58-7-58-24Z" fill={`url(#r${id})`} />
        </svg>
      );
  }
}
