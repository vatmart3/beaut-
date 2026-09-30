"use client";

import { motion } from "motion/react";
import { Fragment, type ReactNode } from "react";

type TextTag = "p" | "h1" | "h2" | "h3" | "h4" | "span" | "div" | "blockquote";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

/**
 * Texte qui monte mot à mot sous un masque (effet « ligne par ligne »),
 * avec une inertie douce. En mouvement réduit : simple fondu.
 */
export function LineReveal({
  text,
  as: Tag = "p",
  className,
  delay = 0,
  stagger = 0.045,
  once = true,
  amount = 0.5,
  children,
  id,
}: {
  id?: string;
  text: string;
  as?: TextTag;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  amount?: number;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className} id={id}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="block"
        initial="hidden"
        whileInView="show"
        viewport={{ once, amount }}
        transition={{ staggerChildren: reduced ? 0 : stagger, delayChildren: delay }}
      >
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              variants={
                reduced
                  ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
                  : {
                      hidden: { y: "108%", rotate: 2 },
                      show: { y: "0%", rotate: 0, transition: { duration: 1.05, ease: ease.veil } },
                    }
              }
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
      {children}
    </Tag>
  );
}

/** Lettres qui se composent en sortant d'un flou, dans le désordre. */
export function Compose({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const count = text.replace(/ /g, "").length;
  let n = 0;
  return (
    <span className={cn("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, wi) => (
          <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(w).map((l, li) => {
              const k = n++;
              const order = ((k * 7919) % count) / count;
              return (
                <motion.span
                  key={li}
                  className="inline-block"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 6 }}
                  whileInView={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.9, delay: delay + order * 0.6, ease: ease.float }}
                >
                  {l}
                </motion.span>
              );
            })}
          </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
