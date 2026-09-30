"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { Icon } from "@/components/icons/Icon";
import { ease } from "@/lib/motion";

/** CTA collant mobile : Réserver un soin / Offrir / Appeler. */
export function StickyCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const on = () => setVisible(window.scrollY > 280);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const onReserver = pathname.startsWith("/reserver");
  const onCadeaux = pathname.startsWith("/bons-cadeaux");

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      initial={false}
      animate={{ y: visible ? 0 : 120, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: ease.veil }}
      aria-hidden={!visible}
    >
      <nav aria-label="Actions rapides" className="flex items-center gap-2 rounded-full bg-ecume/90 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-md">
        {!onReserver ? (
          <Link href="/reserver" tabIndex={visible ? 0 : -1} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-prune px-4 font-display text-[0.95rem] text-lait">
            Réserver un soin
          </Link>
        ) : null}
        {!onCadeaux ? (
          <Link href="/bons-cadeaux" tabIndex={visible ? 0 : -1} className="flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-prune/25 px-4 font-display text-[0.95rem]">
            <Icon name="cadeau" size={18} />
            Offrir
          </Link>
        ) : null}
        <a
          href={site.contact.phoneHref}
          tabIndex={visible ? 0 : -1}
          aria-label={`Appeler l'institut au ${site.contact.phone}`}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-sable"
        >
          <Icon name="telephone" size={20} />
        </a>
      </nav>
    </motion.div>
  );
}
