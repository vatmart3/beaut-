import Link from "next/link";
import { formatPrix, getCategorie, prixDepart, type Soin } from "@/data/soins";
import { Matiere } from "@/components/ui/Matiere";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { aPartirDe, plageDuree } from "./filters";

/**
 * Une ligne de la carte. Pas une « carte produit » : une ligne de menu,
 * éditoriale, où la matière du soin se révèle au survol (desktop) et reste
 * visible en vignette-galet sur mobile. Toute la ligne mène à la fiche
 * (lien étiré) ; « Réserver » reste un lien distinct, au-dessus.
 */
export function SoinLigne({ soin, index, headingLevel = "h4" }: { soin: Soin; index: string; headingLevel?: "h3" | "h4" }) {
  return soin.signature ? <Signature soin={soin} index={index} Heading={headingLevel} /> : <Ligne soin={soin} index={index} Heading={headingLevel} />;
}

function Prix({ soin, large }: { soin: Soin; large?: boolean }) {
  const des = aPartirDe(soin);
  return (
    <p className="flex flex-col items-end leading-none">
      <span className={cn("text-micro text-prune-mute", !des && soin.personnes !== 2 && "invisible")}>
        {des ? "à partir de" : soin.personnes === 2 ? "pour deux" : " "}
      </span>
      <span className={cn("tabular mt-1.5 font-serif text-prune", large ? "text-[clamp(2rem,1.4rem+2vw,3.4rem)]" : "text-[clamp(1.5rem,1.2rem+1vw,2.1rem)]")}>
        {formatPrix(prixDepart(soin))}
      </span>
    </p>
  );
}

function Reserver({ slug, nom }: { slug: string; nom: string }) {
  return (
    <Link
      href={`/reserver?soin=${slug}`}
      aria-label={`Réserver : ${nom}`}
      className="relative z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-prune/25 px-4 font-display text-[0.8125rem] text-prune transition-[background-color,border-color,color] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune hover:bg-prune hover:text-lait active:scale-[0.97] focus-visible:border-prune"
    >
      Réserver
      <Icon name="calendrier" size={16} />
    </Link>
  );
}

function Duree({ soin }: { soin: Soin }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption text-prune-soft">
      <Icon name="horloge" size={16} className="shrink-0 text-prune-mute" />
      <span className="tabular">{plageDuree(soin)}</span>
    </span>
  );
}

const titre =
  "font-display font-light tracking-[-0.035em] text-prune transition-transform duration-[var(--dur-4)] ease-[var(--ease-veil)] group-hover:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0";

/** Lien étiré : toute la ligne est cliquable, le focus reste sur le nom. */
const etire = "after:absolute after:inset-0 after:z-[1] after:rounded-[var(--radius-card)] after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-prune";

function Ligne({ soin, index, Heading }: { soin: Soin; index: string; Heading: "h3" | "h4" }) {
  return (
    <article className="group relative grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 rounded-[var(--radius-card)] px-2 py-6 transition-colors duration-[var(--dur-3)] ease-[var(--ease-veil)] hover:bg-lait sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:px-4 lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:py-8">
      {/* Matière : vignette-galet sur mobile, révélation au survol sur desktop */}
      <div
        aria-hidden
        className="galet relative size-16 overflow-hidden shadow-[var(--shadow-galet)] sm:size-[4.5rem] lg:pointer-events-none lg:absolute lg:left-[47%] lg:top-1/2 lg:z-0 lg:h-52 lg:w-40 lg:-translate-y-1/2 lg:rotate-[-6deg] lg:scale-90 lg:opacity-0 lg:[clip-path:circle(0%_at_50%_60%)] lg:transition-[clip-path,opacity,transform] lg:duration-[900ms] lg:ease-[var(--ease-veil)] lg:group-hover:rotate-[3deg] lg:group-hover:scale-100 lg:group-hover:opacity-100 lg:group-hover:[clip-path:circle(75%_at_50%_60%)] lg:group-focus-within:scale-100 lg:group-focus-within:opacity-100 lg:group-focus-within:[clip-path:circle(75%_at_50%_60%)]"
      >
        <Matiere kind={soin.matiere} breathe={false} className="size-full" sizes="(min-width: 1024px) 10rem, 4.5rem" />
      </div>

      <div className="min-w-0 lg:col-span-6 lg:col-start-1 lg:flex lg:items-baseline lg:gap-6">
        <span aria-hidden className="tabular hidden font-serif text-caption text-prune-mute lg:inline">
          {index}
        </span>
        <div className="min-w-0">
          <Heading className={cn(titre, "text-[clamp(1.45rem,1.05rem+1.5vw,2.6rem)] leading-[1.05]")}>
            <Link href={`/soins/${soin.slug}`} className={etire}>
              {soin.nom}
            </Link>
          </Heading>
          <p className="mt-2 max-w-[46ch] text-[0.95rem] leading-snug text-prune-soft">{soin.accroche}</p>
        </div>
      </div>

      <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-start-2 lg:col-span-2 lg:col-start-8 lg:flex-col lg:items-start">
        <Duree soin={soin} />
        {soin.personnes === 2 ? <span className="text-caption text-sauge-deep">Cabine duo</span> : null}
      </div>

      <div className="relative z-10 col-start-2 flex items-end justify-between gap-4 sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:flex-col sm:items-end sm:justify-center lg:col-span-3 lg:col-start-10 lg:row-span-1 lg:flex-row lg:items-center lg:justify-end">
        <Prix soin={soin} />
        <Reserver slug={soin.slug} nom={soin.nom} />
      </div>
    </article>
  );
}

function Signature({ soin, index, Heading }: { soin: Soin; index: string; Heading: "h3" | "h4" }) {
  const cat = getCategorie(soin.categorie);
  return (
    <article className="group relative grid gap-6 rounded-[var(--radius-card)] px-2 py-8 transition-colors duration-[var(--dur-3)] ease-[var(--ease-veil)] hover:bg-lait sm:px-4 lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:py-12">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] lg:order-2 lg:col-span-4 lg:col-start-9 lg:aspect-[4/5]">
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-veil)] group-hover:scale-[1.045] motion-reduce:transition-none">
          <Matiere kind={soin.matiere} className="size-full" sizes="(min-width: 1024px) 26vw, 92vw" />
        </div>
        <span className="absolute left-3 top-3 z-10 inline-flex min-h-8 items-center rounded-full bg-ecume/90 px-3 font-display text-micro text-prune">
          Signature BRUME
        </span>
      </div>

      <div className="min-w-0 lg:order-1 lg:col-span-7">
        <p className="eyebrow flex items-center gap-3 text-argile-deep">
          <span className="tabular font-serif text-caption normal-case tracking-normal text-prune-mute">{index}</span>
          {cat.label}
        </p>
        <Heading className={cn(titre, "mt-4 text-[clamp(2.1rem,1.2rem+3.4vw,4.6rem)] leading-[0.98]")}>
          <Link href={`/soins/${soin.slug}`} className={etire}>
            {soin.nom}
          </Link>
        </Heading>
        <p className="mt-4 max-w-[40ch] text-lead text-prune-soft">{soin.accroche}</p>
        <p className="mt-3 max-w-[52ch] text-[0.95rem] text-prune-mute">{soin.pourQui}</p>
        <div className="relative z-10 mt-7 flex flex-wrap items-end justify-between gap-5 border-t hairline pt-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Duree soin={soin} />
            {soin.personnes === 2 ? <span className="text-caption text-sauge-deep">Cabine duo · pour deux</span> : null}
          </div>
          <div className="flex items-end gap-4">
            <Prix soin={soin} large />
            <Reserver slug={soin.slug} nom={soin.nom} />
          </div>
        </div>
      </div>
    </article>
  );
}
