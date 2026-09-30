"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition, type MouseEvent, type ReactNode, type Ref } from "react";
import { categories, getCategorie, soins, type CategorieId, type Soin } from "@/data/soins";
import { RippleCanvas } from "@/components/effects/RippleCanvas";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";
import {
  ecrireFiltres,
  estVide,
  filtrer,
  filtresVides,
  lireFiltres,
  optionsCategorie,
  optionsDuree,
  optionsPrix,
  type Filtres,
} from "./filters";
import { numero } from "./lib";
import { SoinLigne } from "./SoinLigne";

/**
 * Carte des soins filtrable. L'état vit dans l'URL (?categorie=&duree=&prix=)
 * pour être partageable ; la page reste statique : ce composant lit l'URL
 * côté client, sous <Suspense>, avec `CarteSoinsStatique` en repli.
 */
export function CarteSoins() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const cle = sp.toString();
  const [filtres, setFiltres] = useState<Filtres>(() => lireFiltres(sp));
  const [cleVue, setCleVue] = useState(cle);

  // L'URL a changé sans nous (lien interne, retour) : on se réaligne pendant le rendu.
  if (cle !== cleVue) {
    setCleVue(cle);
    setFiltres(lireFiltres(sp));
  }

  const onChange = (next: Filtres) => {
    setFiltres(next);
    startTransition(() => router.replace(`${pathname}${ecrireFiltres(next)}`, { scroll: false }));
  };

  return <CarteVue filtres={filtres} onChange={onChange} />;
}

/** Repli statique (prérendu) : la carte complète, filtrable localement. */
export function CarteSoinsStatique() {
  const [filtres, setFiltres] = useState<Filtres>(filtresVides);
  return <CarteVue filtres={filtres} onChange={setFiltres} />;
}

function CarteVue({ filtres, onChange }: { filtres: Filtres; onChange: (f: Filtres) => void }) {
  const reduced = useReducedMotion();
  const zone = useRef<HTMLDivElement>(null);
  const [onde, setOnde] = useState({ n: 0, x: 0.5, y: 0 });

  const resultats = filtrer(soins, filtres);
  const groupes = categories
    .map((c) => ({ ...c, soins: resultats.filter((s) => s.categorie === c.id) }))
    .filter((g) => g.soins.length > 0);
  const index = new Map(soins.map((s, i) => [s.slug, numero(i)]));
  const cat = filtres.categorie ? getCategorie(filtres.categorie) : null;

  /** Tout changement de famille relance l'onde — depuis la pastille cliquée, ou le haut de la liste. */
  const changer = (next: Filtres, source?: HTMLElement) => {
    if (next.categorie !== filtres.categorie) {
      const box = zone.current?.getBoundingClientRect();
      const r = source?.getBoundingClientRect();
      if (box && box.width > 0 && box.height > 0) {
        const x = r ? (r.left + r.width / 2 - box.left) / box.width : 0.5;
        const y = r ? (r.top + r.height / 2 - box.top) / box.height : 0.08;
        setOnde((o) => ({ n: o.n + 1, x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }));
      }
    }
    onChange(next);
  };

  const choisirCategorie = (id: CategorieId | null, e: MouseEvent<HTMLButtonElement>) => {
    if (id !== filtres.categorie) changer({ ...filtres, categorie: id }, e.currentTarget);
  };

  const actifs = [
    filtres.categorie && { key: "categorie" as const, label: getCategorie(filtres.categorie).court },
    filtres.duree && { key: "duree" as const, label: optionsDuree.find((o) => o.id === filtres.duree)!.label },
    filtres.prix && { key: "prix" as const, label: optionsPrix.find((o) => o.id === filtres.prix)!.label },
  ].filter(Boolean) as { key: keyof Filtres; label: string }[];

  return (
    <div className="relative">
      {/* Zone de l'onde : filtres + haut de la liste (≈ un écran) */}
      <div ref={zone} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[min(100%,100svh)] overflow-hidden rounded-[var(--radius-shell)]">
        <RippleCanvas trigger={onde.n} origin={{ x: onde.x, y: onde.y }} duration={2.2} strength={0.55} light="#FFFFFF" shadow="#D4A78F" />
      </div>

      {/* — Filtres ———————————————————————————————————————— */}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-6">
        <Groupe legend="Famille" className="lg:col-span-6">
          {optionsCategorie.map((o) => (
            <Pastille key={o.label} groupe="categorie" active={filtres.categorie === o.id} onClick={(e) => choisirCategorie(o.id, e)}>
              {o.label}
            </Pastille>
          ))}
        </Groupe>
        <Groupe legend="Durée" className="lg:col-span-3">
          {optionsDuree.map((o) => (
            <Pastille key={o.label} groupe="duree" active={filtres.duree === o.id} onClick={() => onChange({ ...filtres, duree: o.id })}>
              {o.label}
            </Pastille>
          ))}
        </Groupe>
        <Groupe legend="Budget" className="lg:col-span-3">
          {optionsPrix.map((o) => (
            <Pastille key={o.label} groupe="prix" active={filtres.prix === o.id} onClick={() => onChange({ ...filtres, prix: o.id })}>
              {o.label}
            </Pastille>
          ))}
        </Groupe>
      </div>

      {/* — Compteur + filtres actifs ——————————————————————————— */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t hairline pt-6">
        <p role="status" aria-live="polite" aria-atomic="true" className="flex items-baseline gap-2 text-prune-soft">
          <span className="tabular font-serif text-[2rem] leading-none text-prune">{resultats.length}</span>
          <span>
            {resultats.length > 1 ? "soins" : "soin"}
            {estVide(filtres) ? " à la carte" : ` sur ${soins.length}`}
          </span>
        </p>
        {actifs.length ? (
          <ul className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
            {actifs.map((a) => (
              <li key={a.key}>
                <button
                  type="button"
                  onClick={(e) => changer({ ...filtres, [a.key]: null }, e.currentTarget)}
                  className="group/chip inline-flex min-h-11 items-center gap-2 rounded-full bg-sable/70 pl-4 pr-2 font-display text-[0.8125rem] text-prune transition-[background-color,scale] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:bg-argile-pale active:scale-[0.97]"
                >
                  {a.label}
                  <span className="grid size-7 place-items-center rounded-full bg-ecume transition-transform duration-[var(--dur-3)] ease-[var(--ease-veil)] group-hover/chip:rotate-90">
                    <Icon name="fermer" size={14} />
                  </span>
                  <span className="sr-only">(retirer ce filtre)</span>
                </button>
              </li>
            ))}
            {actifs.length > 1 ? (
              <li>
                <button
                  type="button"
                  onClick={(e) => changer(filtresVides, e.currentTarget)}
                  className="min-h-11 rounded-full px-3 font-display text-[0.8125rem] text-prune-soft underline decoration-prune/30 underline-offset-4 transition-colors hover:text-prune hover:decoration-prune"
                >
                  Tout effacer
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {/* — Intro de la famille filtrée ——————————————————————————— */}
      <AnimatePresence mode="wait" initial={false}>
        {cat ? (
          <motion.div
            key={cat.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: ease.veil }}
            className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-x-6"
          >
            <h3 className="font-display text-[clamp(2.4rem,1.4rem+4vw,5.5rem)] font-light leading-[0.95] tracking-[-0.045em] lg:col-span-6">{cat.label}</h3>
            <p className="max-w-[44ch] self-end text-lead text-prune-soft lg:col-span-5 lg:col-start-8">{cat.intro}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* — Liste ——————————————————————————————————————————————— */}
      <LayoutGroup>
        <div className="relative mt-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {groupes.length === 0 ? (
              <Vide key="vide" onReset={() => changer(filtresVides)} reduced={reduced} />
            ) : (
              groupes.map((g) => (
                <motion.section
                  key={g.id}
                  layout={reduced ? false : "position"}
                  aria-labelledby={cat ? undefined : `famille-${g.id}`}
                  aria-label={cat ? cat.label : undefined}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)", transition: { duration: 0.35, ease: ease.fall } }}
                  transition={{ duration: 0.9, ease: ease.veil }}
                  className={cn("grid gap-4 lg:grid-cols-12 lg:gap-x-6", !cat && "border-t hairline pt-8 lg:pt-10 [&+&]:mt-10")}
                >
                  {cat ? null : (
                    <header className="lg:col-span-3">
                      <div className="lg:sticky lg:top-28">
                        <p className="tabular font-serif text-caption text-prune-mute">
                          {String(g.soins.length).padStart(2, "0")} {g.soins.length > 1 ? "soins" : "soin"}
                        </p>
                        <h3 id={`famille-${g.id}`} className="mt-2 font-display text-title font-light tracking-[-0.035em]">
                          {g.label}
                        </h3>
                      </div>
                    </header>
                  )}
                  <ul className={cn("relative divide-y divide-[var(--color-ligne)]", cat ? "lg:col-span-12" : "lg:col-span-9")}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {g.soins.map((s, i) => (
                        <Rangee key={s.slug} soin={s} i={i} numero={index.get(s.slug)!} reduced={reduced} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.section>
              ))
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}

function Rangee({ soin, i, numero, reduced, ref }: { soin: Soin; i: number; numero: string; reduced: boolean; ref?: Ref<HTMLLIElement> }) {
  return (
    <motion.li
      ref={ref}
      className="relative hover:z-10 focus-within:z-10"
      layout={reduced ? false : "position"}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985, filter: "blur(8px)", transition: { duration: 0.3, ease: ease.fall } }}
      transition={{ duration: 0.85, delay: reduced ? 0 : Math.min(i, 6) * 0.06, ease: ease.veil }}
    >
      <SoinLigne soin={soin} index={numero} />
    </motion.li>
  );
}

function Groupe({ legend, className, children }: { legend: string; className?: string; children: ReactNode }) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="eyebrow mb-3 text-prune-mute">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Pastille({
  groupe,
  active,
  onClick,
  children,
}: {
  groupe: string;
  active: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "relative inline-flex min-h-11 items-center justify-center rounded-full border px-4 font-display text-[0.875rem] leading-none tracking-[-0.005em] transition-[border-color,color,scale] duration-[var(--dur-2)] ease-[var(--ease-veil)] active:scale-[0.96]",
        active ? "border-prune text-lait" : "border-prune/25 text-prune hover:border-prune/70",
      )}
    >
      {active ? (
        <motion.span
          layoutId={reduced ? undefined : `pastille-${groupe}`}
          aria-hidden
          className="absolute inset-0 rounded-full bg-prune"
          transition={{ duration: 0.55, ease: ease.veil }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}

function Vide({ onReset, reduced, ref }: { onReset: () => void; reduced: boolean; ref?: Ref<HTMLDivElement> }) {
  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.8, ease: ease.veil }}
      className="grid gap-8 rounded-[var(--radius-card)] bg-lait px-6 py-12 sm:px-10 lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:py-16"
    >
      <div aria-hidden className="relative mx-auto h-28 w-40 lg:col-span-3 lg:mx-0">
        <span className="galet absolute bottom-0 left-2 h-12 w-28 bg-sable shadow-[var(--shadow-galet)]" />
        <span className="galet absolute bottom-9 left-10 h-10 w-20 bg-sauge-pale shadow-[var(--shadow-galet)] motion-safe:animate-drift" />
        <span className="galet absolute bottom-[4.4rem] left-16 h-7 w-12 bg-argile-pale shadow-[var(--shadow-galet)]" />
      </div>
      <div className="lg:col-span-6">
        <h3 className="font-display text-title font-light tracking-[-0.035em]">Aucun soin ne réunit ces critères.</h3>
        <p className="mt-3 max-w-[48ch] text-prune-soft">
          Élargissez la durée ou le budget : la plupart de nos soins existent en plusieurs formules. Ou appelez-nous, nous trouverons
          ensemble le bon protocole.
        </p>
      </div>
      <div className="lg:col-span-3 lg:justify-self-end">
        <Button onClick={onReset} variant="solid" icon="retourner">
          Réinitialiser les filtres
        </Button>
      </div>
    </motion.div>
  );
}
