"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons/Icon";
import { useCoarsePointer, useReducedMotion } from "@/lib/device";

type Variant = "solid" | "outline" | "soft" | "ghost" | "lait";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-3 rounded-full font-display font-normal tracking-[-0.01em] whitespace-nowrap transition-[background-color,color,border-color,box-shadow] duration-[var(--dur-2)] ease-[var(--ease-veil)] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  solid: "bg-prune text-lait hover:bg-[#2c1f26] active:bg-[#23191f]",
  outline: "border border-prune/70 text-prune hover:bg-prune hover:text-lait",
  soft: "bg-sable text-prune hover:bg-argile-pale",
  ghost: "text-prune hover:bg-prune/5",
  lait: "bg-lait text-prune hover:bg-white",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-5 text-[0.875rem]",
  md: "min-h-12 px-6 text-[0.95rem]",
  lg: "min-h-14 px-7 text-[1.02rem] sm:min-h-16 sm:px-8",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconLeft?: IconName;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & Omit<ComponentProps<"button">, "children" | "className">;
type LinkProps = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "children" | "className" | "href">;

function useMagnet(enabled: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const onMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current || e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    x.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 10);
    y.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 8);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };
  return { ref, style: { x: sx, y: sy }, onMove, onLeave };
}

function Inner({ icon, iconLeft, children }: Pick<CommonProps, "icon" | "iconLeft" | "children">) {
  return (
    <>
      {iconLeft ? <Icon name={iconLeft} size={18} className="-ml-1 shrink-0" /> : null}
      <span className="relative">{children}</span>
      {icon ? (
        <span className="-mr-2 grid size-8 shrink-0 place-items-center rounded-full bg-current/10 transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover/btn:translate-x-0.5 group-hover/btn:rotate-[-8deg]">
          <Icon name={icon} size={16} />
        </span>
      ) : null}
    </>
  );
}

/** Bouton / lien pilule. Magnétique discret à la souris (désactivé au tactile et en mouvement réduit). */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = "solid", size = "md", icon, iconLeft, magnetic = true, className, children } = props;
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const m = useMagnet(magnetic && !coarse && !reduced);
  const cls = cn(base, variants[variant], sizes[size], className);

  const content = <Inner icon={icon} iconLeft={iconLeft}>{children}</Inner>;

  const wrap = (node: ReactNode) => (
    <motion.span
      ref={m.ref}
      style={m.style}
      onPointerMove={m.onMove}
      onPointerLeave={m.onLeave}
      className="inline-flex"
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      {node}
    </motion.span>
  );

  if ("href" in props && props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, size: _s, icon: _i, iconLeft: _il, magnetic: _m, className: _c, children: _ch, href, ...rest } = props;
    const external = /^(https?:|tel:|mailto:)/.test(href);
    if (external) {
      return wrap(
        <a href={href} className={cls} {...(rest as ComponentProps<"a">)} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {content}
        </a>,
      );
    }
    return wrap(
      <Link href={href} className={cls} {...rest}>
        {content}
      </Link>,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, icon: _i, iconLeft: _il, magnetic: _m, className: _c, children: _ch, type = "button", ...rest } =
    props as ButtonProps;
  return wrap(
    <button type={type} className={cls} {...rest}>
      {content}
    </button>,
  );
}
