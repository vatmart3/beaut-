import Link from "next/link";
import { site } from "@/config/site";
import { formatDuree, formatPrix, getCategorie, prixDepart, soins, type Soin } from "@/data/soins";
import { getPraticienne } from "@/data/praticiennes";
import { Matiere } from "@/components/ui/Matiere";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { LineReveal, Compose } from "@/components/effects/LineReveal";
import { ClipReveal, Float, RippleReveal } from "@/components/effects/Reveal";
import { cn } from "@/lib/cn";
import { MontantAnime } from "./effets";
import { aPartirDe, plageDuree } from "./filters";
import { cureDe, numero, soinsLies } from "./lib";
import { SoinLigne } from "./SoinLigne";

/* ————————————————————————————————————————————————————————————————
   Aside de l'en-tête : prix, durée, pour qui
   ———————————————————————————————————————————————————————————————— */
export function FicheAside({ soin }: { soin: Soin }) {
  const des = aPartirDe(soin);
  return (
    <div className="max-w-md">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t hairline pt-6">
        <div>
          <dt className="eyebrow text-prune-mute">{des ? "À partir de" : soin.personnes === 2 ? "Pour deux" : "Tarif"}</dt>
          <dd className="tabular mt-2 font-serif text-[clamp(1.9rem,1.4rem+1.8vw,3rem)] leading-none">{formatPrix(prixDepart(soin))}</dd>
        </div>
        <div>
          <dt className="eyebrow text-prune-mute">Durée en cabine</dt>
          <dd className="tabular mt-2 font-serif text-[clamp(1.9rem,1.4rem+1.8vw,3rem)] leading-[1.05]">{plageDuree(soin)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="eyebrow text-prune-mute">Pour qui</dt>
          <dd className="mt-2 text-prune-soft">{soin.pourQui}</dd>
        </div>
      </dl>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button href={`/reserver?soin=${soin.slug}`} icon="fleche">
          Réserver
        </Button>
        <Button href={`/bons-cadeaux?soin=${soin.slug}`} variant="ghost" iconLeft="cadeau">
          L&rsquo;offrir
        </Button>
      </div>
    </div>
  );
}

/* ————————————————————————————————————————————————————————————————
   Le soin : grand visuel + textures & gestes
   ———————————————————————————————————————————————————————————————— */
export function FicheSoin({ soin }: { soin: Soin }) {
  const cat = getCategorie(soin.categorie);
  return (
    <section className="shell overflow-hidden px-4 py-10 sm:px-8 lg:px-12 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
        <RippleReveal className="lg:col-span-7">
          <Matiere
            kind={soin.matiere}
            label={`Visuel d'ambiance : ${soin.nom}`}
            className="aspect-[4/5] rounded-[var(--radius-card)] sm:aspect-[4/3] lg:aspect-[5/6]"
            sizes="(min-width: 1024px) 55vw, 94vw"
          />
        </RippleReveal>
        <div className="flex flex-col justify-between gap-10 px-1 lg:col-span-4 lg:col-start-9 lg:py-6">
          <div>
            <p className="eyebrow text-argile-deep">{cat.label} · textures &amp; gestes</p>
            <LineReveal
              as="h2"
              text="Ce qui se passe sur la table"
              className="mt-4 font-display text-title font-light leading-[1.05] tracking-[-0.035em]"
            />
            <Float delay={0.15}>
              <p className="mt-6 text-lead text-prune-soft first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[3.4em] first-letter:leading-[0.85] first-letter:text-prune">
                {soin.description}
              </p>
            </Float>
          </div>
          <Float delay={0.3}>
            <div className="rounded-[var(--radius-card)] bg-lait p-6">
              <h3 className="eyebrow flex items-center gap-2 text-prune-mute">
                <Icon name="feuille" size={18} />
                Produits utilisés
              </h3>
              <p className="mt-3 text-[0.98rem] text-prune">{soin.produits}</p>
            </div>
          </Float>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————————————————————
   Variantes : tableau de prix
   ———————————————————————————————————————————————————————————————— */
export function Variantes({ soin }: { soin: Soin }) {
  if (!soin.variantes?.length) return null;
  return (
    <section aria-labelledby="formules" className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-4">
          <p className="eyebrow text-argile-deep">Formules</p>
          <h2 id="formules" className="mt-4 font-display text-title font-light tracking-[-0.035em]">
            Choisissez la zone, la durée suit.
          </h2>
          <p className="mt-4 max-w-[36ch] text-prune-soft">Précisez la formule à la réservation, ou décidez sur place avec la praticienne.</p>
        </div>
        <ClipReveal from="left" className="lg:col-span-7 lg:col-start-6">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Formules et tarifs : {soin.nom}</caption>
            <thead>
              <tr className="border-b border-prune/30">
                <th scope="col" className="eyebrow pb-3 pr-3 font-medium text-prune-mute">
                  Formule
                </th>
                <th scope="col" className="eyebrow pb-3 pr-3 text-right font-medium text-prune-mute">
                  Durée
                </th>
                <th scope="col" className="eyebrow pb-3 text-right font-medium text-prune-mute">
                  Prix
                </th>
              </tr>
            </thead>
            <tbody>
              {soin.variantes.map((v) => (
                <tr key={v.label} className="group border-b hairline transition-colors duration-[var(--dur-2)] hover:bg-lait">
                  <th scope="row" className="py-4 pr-3 font-display text-[clamp(1.05rem,0.95rem+0.5vw,1.35rem)] font-light">
                    {v.label}
                  </th>
                  <td className="tabular whitespace-nowrap py-4 pr-3 text-right text-prune-soft">{formatDuree(v.duree)}</td>
                  <td className="tabular whitespace-nowrap py-4 text-right font-serif text-[1.35rem]">{formatPrix(v.prix)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ClipReveal>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————————————————————
   Cure : ancrage prix
   ———————————————————————————————————————————————————————————————— */
export function CureEncart({ soin }: { soin: Soin }) {
  const c = cureDe(soin.slug);
  if (!c) return null;
  return (
    <section aria-labelledby="en-cure" className="shell grain overflow-hidden bg-sauge-pale px-5 py-14 sm:px-10 lg:px-16 lg:py-20">
      <div className="relative z-[2] grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <div className="lg:col-span-6">
          <p className="eyebrow text-sauge-deep">En cure</p>
          <h2 id="en-cure" className="mt-4 font-display text-[clamp(1.9rem,1.2rem+2.6vw,3.6rem)] font-light leading-[1.02] tracking-[-0.04em]">
            En cure de {c.seances} séances : <span className="font-serif">{formatPrix(c.prix)}</span> au lieu de{" "}
            <s className="decoration-argile-deep/70 decoration-2">{formatPrix(c.unitaire)}</s>
          </h2>
          <p className="mt-5 max-w-[48ch] text-prune-soft">{c.pourquoi}</p>
          <p className="mt-3 flex items-center gap-2 text-caption text-prune-mute">
            <Icon name="calendrier" size={16} />
            {c.rythme}
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="flex items-end gap-6 border-b border-prune/20 pb-6">
            <p className="flex flex-col">
              <span className="eyebrow text-prune-mute">Économie</span>
              <span className="mt-2 font-serif text-[clamp(3.6rem,2.4rem+4vw,6.5rem)] leading-[0.9] text-sauge-deep">
                <MontantAnime valeur={c.economie} />
              </span>
            </p>
            <p className="pb-2 text-prune-soft">
              soit <span className="tabular font-serif text-prune">{formatPrix(c.parSeance)}</span> la séance
              <br />
              <span className="text-caption text-prune-mute">au lieu de {formatPrix(c.soin.prix)}</span>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`/reserver?soin=${soin.slug}`} icon="fleche">
              Commencer la cure
            </Button>
            <Button href="/rituels" variant="ghost">
              Toutes les cures
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————————————————————
   Avant / après / précautions
   ———————————————————————————————————————————————————————————————— */
export function Precautions({ soin }: { soin: Soin }) {
  return (
    <section className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
      <p className="eyebrow text-argile-deep">Pour que le soin porte ses fruits</p>
      <LineReveal
        as="h2"
        text="Avant, après, et ce qu'il faut nous dire"
        className="mt-4 max-w-[20ch] font-display text-[clamp(2rem,1.2rem+3vw,4rem)] font-light leading-[1] tracking-[-0.045em]"
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-x-6">
        <Colonne titre="Avant" items={soin.avant} className="lg:col-span-4" />
        <Colonne titre="Après" items={soin.apres} className="lg:col-span-6 lg:col-start-6 lg:mt-24" delay={0.12} />
      </div>

      <Float className="mt-16 lg:mt-20">
        <div className="grid gap-6 rounded-[var(--radius-card)] bg-argile-pale/70 p-6 sm:p-10 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-4">
            <h3 className="font-display text-[1.6rem] font-light tracking-[-0.03em]">Contre-indications</h3>
            <p className="mt-3 text-[0.95rem] text-prune-soft">
              Signalez-les à la réservation : dans la plupart des cas, nous adaptons le protocole plutôt que d&rsquo;annuler.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <ul className="space-y-3">
              {soin.contreIndications.map((ci) => (
                <li key={ci} className="flex gap-3">
                  <span aria-hidden className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-argile-deep" />
                  <span>{ci}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-prune/15 pt-4 text-caption text-prune-soft">
              Liste non exhaustive. En cas de doute, demandez l&rsquo;avis de votre médecin avant de réserver.
            </p>
          </div>
        </div>
      </Float>
    </section>
  );
}

function Colonne({ titre, items, className, delay = 0 }: { titre: string; items: string[]; className?: string; delay?: number }) {
  return (
    <Float className={className} delay={delay}>
      <h3 className="font-serif text-[clamp(3rem,2rem+3vw,5rem)] leading-none text-argile-deep">{titre}</h3>
      <ol className="mt-6 space-y-4">
        {items.map((it, i) => (
          <li key={it} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2 border-t hairline pt-4">
            <span className="tabular font-serif text-caption text-prune-mute">{numero(i)}</span>
            <span className="text-[1.02rem]">{it}</span>
          </li>
        ))}
      </ol>
    </Float>
  );
}

/* ————————————————————————————————————————————————————————————————
   Les mains : praticiennes
   ———————————————————————————————————————————————————————————————— */
export function Mains({ soin }: { soin: Soin }) {
  const list = soin.praticiennes.map(getPraticienne).filter((p) => p !== undefined);
  if (!list.length) return null;
  return (
    <section aria-labelledby="mains" className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-4">
          <p className="eyebrow text-argile-deep">Les mains</p>
          <h2 id="mains" className="mt-4 font-display text-title font-light tracking-[-0.035em]">
            {list.length > 1 ? "Deux praticiennes réalisent ce soin" : "Une seule praticienne réalise ce soin"}
          </h2>
          <p className="mt-4 max-w-[36ch] text-prune-soft">
            {list.length > 1
              ? "Même protocole, même exigence. Vous pouvez choisir l'une ou l'autre à la réservation."
              : "C'est sa spécialité : le protocole a été construit par elle, il n'est confié à personne d'autre."}
          </p>
        </div>
        <ul className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:gap-x-6">
          {list.map((p, i) => (
            <li key={p.id} className={cn("flex flex-col", i % 2 === 1 && "sm:mt-16")}>
              <div className="flex items-center gap-5">
                <span
                  aria-hidden
                  className={cn(
                    "galet grid size-20 shrink-0 place-items-center font-serif text-[2.2rem] text-prune shadow-[var(--shadow-galet)]",
                    p.teinte === "argile" ? "bg-argile-pale" : "bg-sauge-pale",
                  )}
                >
                  {p.prenom[0]}
                </span>
                <div>
                  <h3 className="font-display text-[1.6rem] font-light tracking-[-0.03em]">
                    <Compose text={`${p.prenom} ${p.nom}`} />
                  </h3>
                  <p className="text-caption text-prune-mute">
                    {p.role} · en cabine depuis {p.depuis}
                  </p>
                </div>
              </div>
              <blockquote className="mt-6 border-l-2 border-argile/60 pl-5 font-serif text-[1.2rem] leading-snug text-prune">
                « {p.mot} »
              </blockquote>
              <p className="mt-4 text-caption text-prune-soft">{p.specialites.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————————————————————
   CTA
   ———————————————————————————————————————————————————————————————— */
export function FicheCta({ soin }: { soin: Soin }) {
  const lienLait =
    "group/l inline-flex min-h-12 items-center gap-3 rounded-full border border-lait/40 px-6 font-display text-[0.95rem] text-lait transition-[background-color,border-color,color,scale] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-lait hover:bg-lait hover:text-prune active:scale-[0.97] focus-visible:outline-lait";
  return (
    <section className="shell relative overflow-hidden bg-prune px-5 py-16 text-lait sm:px-10 lg:px-16 lg:py-24 [&_:focus-visible]:outline-lait">
      <svg aria-hidden viewBox="0 0 600 600" className="pointer-events-none absolute -right-40 -top-40 size-[34rem] text-lait/[0.07]">
        {[80, 140, 200, 260].map((r) => (
          <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="currentColor" strokeWidth="1" />
        ))}
      </svg>
      <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <div className="lg:col-span-7">
          <p className="eyebrow text-argile">{soin.nom}</p>
          <LineReveal
            as="h2"
            text="Réserver ce soin"
            className="mt-4 font-display text-[clamp(2.6rem,1.4rem+5vw,6.5rem)] font-light leading-[0.95] tracking-[-0.045em]"
          />
          <p className="mt-6 max-w-[46ch] text-lait/75">
            En ligne en trois étapes, ou par téléphone. {site.policies.cancellation} Règlement sur place, après le soin.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:col-start-9">
          <Button href={`/reserver?soin=${soin.slug}`} variant="lait" size="lg" icon="fleche">
            Réserver ce soin
          </Button>
          <Link href={`/bons-cadeaux?soin=${soin.slug}`} className={lienLait}>
            <Icon name="cadeau" size={18} />
            L&rsquo;offrir en bon cadeau
          </Link>
          <a href={site.contact.phoneHref} className={cn(lienLait, "border-transparent px-2 hover:border-transparent hover:bg-transparent hover:text-argile")}>
            <Icon name="telephone" size={18} />
            <span className="tabular">{site.contact.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————————————————————
   Soins liés
   ———————————————————————————————————————————————————————————————— */
export function SoinsLies({ soin }: { soin: Soin }) {
  const lies = soinsLies(soin);
  if (!lies.length) return null;
  return (
    <section aria-labelledby="lies" className="shell px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="grid gap-8 px-1 lg:grid-cols-12 lg:gap-x-6 lg:px-4">
        <p className="eyebrow text-argile-deep lg:col-span-3">Dans le même esprit</p>
        <h2 id="lies" className="font-display text-title font-light tracking-[-0.035em] lg:col-span-8 lg:col-start-5">
          D&rsquo;autres soins qui prolongent celui-ci
        </h2>
      </div>
      <ul className="mt-10 divide-y divide-[var(--color-ligne)] border-t hairline">
        {lies.map((s, i) => (
          <li key={s.slug}>
            <Float delay={i * 0.08} y={18}>
              <SoinLigne soin={s} index={numero(soins.indexOf(s))} headingLevel="h3" variant="ligne" />
            </Float>
          </li>
        ))}
      </ul>
    </section>
  );
}
