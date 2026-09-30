import Link from "next/link";
import { site } from "@/config/site";
import { espaces, hygiene, produitsInstitut } from "@/data/institut";
import { anneesCumulees, praticiennes } from "@/data/praticiennes";
import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { ClipReveal, Counter, Float, RippleReveal } from "@/components/effects/Reveal";
import { Compose, LineReveal } from "@/components/effects/LineReveal";
import { SectionTitle } from "@/features/contenu/SectionTitle";
import { Portrait } from "@/features/contenu/Portrait";
import { EspaceRow } from "@/features/contenu/institut/Espaces";
import { HygieneSequence } from "@/features/contenu/institut/Hygiene";
import { Tasse } from "@/features/contenu/institut/Tasse";

export const metadata = pageMetadata({
  title: "L'institut · Cabine duo & tisanerie à Balaruc-les-Bains",
  description:
    "Cabine duo, cabine visage et tisanerie au cœur du quartier thermal de Balaruc-les-Bains. Nos produits, notre protocole d'hygiène, nos praticiennes.",
  path: "/institut",
});

const anneesDeMetier = (depuis: number) => new Date().getFullYear() - depuis;

const infusions = [
  { nom: "Verveine du jardin", note: "infusée 5 min, servie tiède" },
  { nom: "Thym-citron", note: "après un modelage, pour la gorge et le souffle" },
  { nom: "Rooibos", note: "sans théine, rond, légèrement vanillé" },
  { nom: "Eau au concombre", note: "fraîche, l'été et après un gommage" },
];

export default function InstitutPage() {
  const annees = anneesCumulees();
  const [duo, visage, tisanerie] = [espaces.find((e) => e.id === "cabine-duo")!, espaces.find((e) => e.id === "cabine-soin")!, espaces.find((e) => e.id === "tisanerie")!];
  const chiffres = [
    { n: annees, label: "années d'expérience cumulées, entre Clémence et Inès" },
    { n: 1, label: "cabine duo, deux tables chauffantes côte à côte" },
    { n: 6, label: "places en tisanerie, sur des banquettes basses" },
    { n: 15, label: "minutes au moins entre deux rendez-vous" },
    { n: 4, label: "minutes à pied des thermes" },
  ];

  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="L'institut"
        title="Un lieu calme, au cœur du quartier thermal"
        crumbs={[{ name: "L'institut", path: "/institut" }]}
        lead={
          <p>
            Un rez-de-chaussée de la rue des Sources, à Balaruc-les-Bains, à quatre minutes à pied des thermes. Trois pièces, deux praticiennes, et le
            temps qu&apos;il faut entre deux rendez-vous.
          </p>
        }
      />

      {/* ——— Chiffres */}
      <section aria-label="L'institut en chiffres" className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-6">
            <p className="font-serif text-[clamp(7rem,4rem+14vw,17rem)] leading-[0.8] tracking-[-0.03em] text-argile-deep">
              <span className="sr-only">{chiffres[0].n}</span>
              <span aria-hidden>
                <Counter to={chiffres[0].n} duration={2.2} />
              </span>
            </p>
            <p className="mt-4 max-w-[24ch] text-lead">{chiffres[0].label}</p>
          </div>
          <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-6 lg:mt-24">
            {chiffres.slice(1).map((c, i) => (
              <Float key={c.label} delay={i * 0.1} y={30 + i * 10} className={i % 2 === 1 ? "border-t hairline py-6 sm:mt-16" : "border-t hairline py-6"}>
                <dt className="sr-only">{c.label}</dt>
                <dd>
                  <span className="sr-only">{c.n}</span>
                  <span aria-hidden className="block font-serif text-[clamp(3rem,2rem+3vw,5rem)] leading-none">
                    <Counter to={c.n} />
                  </span>
                  <span className="mt-2 block max-w-[26ch] text-prune-soft" aria-hidden>
                    {c.label}
                  </span>
                </dd>
              </Float>
            ))}
          </dl>
        </div>
      </section>

      {/* ——— Le lieu */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <SectionTitle eyebrow="Le lieu" title="Trois pièces, pas une de plus" className="lg:col-span-7" />
          <p className="self-end text-prune-soft lg:col-span-4 lg:col-start-9">
            Balaruc-les-Bains est l&apos;une des premières stations thermales de France. L&apos;institut en a gardé le rythme : on n&apos;y court
            jamais, et la lumière reste basse.
          </p>
        </div>
        <div className="mt-16 space-y-24 lg:mt-24 lg:space-y-36">
          <EspaceRow espace={duo} index={0} />
          <EspaceRow espace={visage} index={1} />
        </div>
      </section>

      {/* ——— La tisanerie */}
      <section className="shell overflow-hidden bg-sauge-pale px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="eyebrow text-sauge-deep">La tisanerie</p>
            <h2 className="mt-3 font-display text-[clamp(2.1rem,1.2rem+3.4vw,4.75rem)] font-light leading-[0.98] tracking-[-0.04em]">
              <Compose text="Le soin continue ici." />
            </h2>
            <p className="mt-6 max-w-[48ch] text-lead leading-relaxed text-prune-soft">{tisanerie.texte}</p>
            <p className="mt-4 inline-flex rounded-full bg-ecume px-4 py-2 font-serif text-[1.1rem]">{tisanerie.chiffre}</p>
          </div>
          <div className="relative lg:col-span-5 lg:col-start-8">
            <Tasse className="absolute -top-16 right-2 w-28 text-sauge-deep sm:right-8 sm:w-36" />
            <div className="rounded-[var(--radius-card)] bg-ecume p-6 shadow-[var(--shadow-veil)] sm:p-8">
              <h3 className="eyebrow text-prune-mute">À la carte, offert</h3>
              <ul className="mt-4">
                {infusions.map((f, i) => (
                  <li key={f.nom} className="border-b hairline last:border-b-0">
                    <ClipReveal from="left" delay={0.2 + i * 0.12} className="flex flex-col py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                      <span className="font-display text-[1.2rem]">{f.nom}</span>
                      <span className="text-[0.875rem] text-prune-soft sm:text-right">{f.note}</span>
                    </ClipReveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Les produits */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionTitle eyebrow="Les produits" title="Ce qui touche votre peau" />
            <p className="mt-8 font-serif text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)] leading-none">{produitsInstitut.marque}</p>
            <Pill className="mt-3 border-dashed">{produitsInstitut.note}</Pill>
            <ul className="mt-8 space-y-3">
              {produitsInstitut.engagements.map((e) => (
                <li key={e} className="flex gap-3 text-prune-soft">
                  <span aria-hidden className="mt-2.5 inline-block size-1.5 shrink-0 rounded-full bg-argile-deep" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h3 className="sr-only">Les matières premières</h3>
            <table className="w-full border-collapse text-left">
              <caption className="pb-4 text-left text-[0.8125rem] text-prune-mute">Matières premières utilisées en cabine</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Matière</th>
                  <th scope="col">Origine</th>
                  <th scope="col">Usage</th>
                </tr>
              </thead>
              <tbody>
                {produitsInstitut.matieres.map((m) => (
                  <tr key={m.nom} className="border-t hairline align-top">
                    <th scope="row" className="py-6 pr-4 font-display text-[clamp(1.25rem,1rem+0.8vw,1.6rem)] font-light leading-tight">
                      <LineReveal text={m.nom} as="span" className="block" />
                    </th>
                    <td className="py-6 text-[0.95rem] leading-snug">
                      <span className="block text-prune">{m.origine}</span>
                      <span className="mt-1 block text-prune-mute">{m.usage}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ——— Hygiène */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionTitle eyebrow="Le protocole d'hygiène" title="Ce que vous ne voyez pas" size="md" />
              <p className="mt-6 max-w-[34ch] text-prune-soft">
                Cinq règles, appliquées entre chaque cliente, sans exception. C&apos;est aussi pour elles que nous laissons un quart d&apos;heure entre
                deux rendez-vous.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <HygieneSequence etapes={hygiene} />
          </div>
        </div>
      </section>

      {/* ——— Les praticiennes */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <SectionTitle eyebrow="Les praticiennes" title="Deux paires de mains" />
        <div className="mt-16 space-y-24 lg:space-y-32">
          {praticiennes.map((p, i) => {
            const ans = anneesDeMetier(p.depuis);
            return (
              <article key={p.id} className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
                <RippleReveal className={i % 2 ? "lg:order-2 lg:col-span-4 lg:col-start-9" : "lg:col-span-4"}>
                  <Portrait
                    initiale={p.prenom[0]}
                    teinte={p.teinte}
                    className="mx-auto w-[min(100%,20rem)]"
                    label={`Portrait provisoire de ${p.prenom} : un galet frappé de son initiale`}
                  />
                </RippleReveal>
                <div className={i % 2 ? "lg:order-1 lg:col-span-7" : "lg:col-span-7 lg:col-start-6"}>
                  <h3 className="font-display text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] font-light leading-none tracking-[-0.04em]">
                    {p.prenom} {p.nom}
                  </h3>
                  <p className="mt-3 text-prune-soft">
                    {p.role} · depuis {p.depuis}, soit {ans} ans de métier
                  </p>
                  <blockquote className="mt-8 border-l-2 border-argile pl-6">
                    <p className="font-serif text-[clamp(1.35rem,1.1rem+1vw,2rem)] leading-[1.25]">« {p.mot} »</p>
                  </blockquote>
                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                      <h4 className="eyebrow text-prune-mute">Formation</h4>
                      <ul className="mt-3 space-y-2 text-[0.95rem] leading-snug">
                        {p.formation.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="eyebrow text-prune-mute">Spécialités</h4>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {p.specialites.map((s) => (
                          <li key={s}>
                            <Pill>{s}</Pill>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button href={`/reserver?praticienne=${p.id}`} variant="outline" icon="fleche">
                      Réserver avec {p.prenom}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ——— Venir */}
      <section className="shell grain overflow-hidden bg-prune px-5 py-16 text-lait sm:px-10 lg:px-16 lg:py-24">
        <div className="relative z-[2] grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-lait/60">{site.address.street}</p>
            <LineReveal
              as="h2"
              text="Le mieux, c'est de venir voir."
              className="mt-4 font-display text-[clamp(2.2rem,1.3rem+3.6vw,5rem)] font-light leading-[0.98] tracking-[-0.04em]"
            />
          </div>
          <div className="flex flex-wrap gap-2 lg:col-span-5 lg:justify-end">
            <Button href="/reserver" variant="lait" icon="fleche" size="lg">
              Réserver un soin
            </Button>
            <Link
              href="/infos-pratiques"
              className="inline-flex min-h-14 items-center rounded-full border border-lait/40 px-7 font-display transition-colors duration-[var(--dur-2)] hover:border-lait hover:bg-lait hover:text-prune sm:min-h-16 ease-[var(--ease-veil)]"
            >
              Accès & horaires
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
