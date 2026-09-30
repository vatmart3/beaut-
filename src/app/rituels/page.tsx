import Link from "next/link";
import { site } from "@/config/site";
import { cures, detailsCure } from "@/data/rituels";
import { formatDuree, formatPrix, soins } from "@/data/soins";
import { PageIntro } from "@/components/ui/PageIntro";
import { Matiere } from "@/components/ui/Matiere";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { Compose, LineReveal } from "@/components/effects/LineReveal";
import { ClipReveal, RippleReveal } from "@/components/effects/Reveal";
import { JsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { CuresGalets } from "@/features/soins/CuresGalets";
import { Comparatif } from "@/features/soins/Comparatif";
import { Glisse, MontantAnime, Parallaxe, Trace } from "@/features/soins/effets";

export const metadata = pageMetadata({
  title: "Cures et rituels duo à Balaruc-les-Bains | BRUME",
  description:
    "Cures de 3 ou 5 séances avec l'économie affichée, modelage et rituel duo en cabine double à Balaruc-les-Bains, près de Sète. Prix par séance détaillés.",
  path: "/rituels",
});

const conditions = [
  {
    titre: "Une cure est nominative",
    texte:
      "Elle suit une peau, un dos, des jambes : les vôtres. Seule exception, la cure de modelages peut être partagée avec une personne de votre foyer.",
  },
  {
    titre: "Valable 6 mois",
    texte: `À compter de la première séance, pour les cures de 5 comme de 3 séances : de quoi suivre le rythme conseillé avec de la marge. Offerte en bon cadeau, une cure reste valable ${site.policies.giftValidityMonths} mois.`,
  },
  {
    titre: "Réglée sur place",
    texte: "Rien n'est prélevé en ligne. La cure se règle à l'institut, le jour de la première séance : carte bancaire, espèces ou chèques-cadeaux BRUME.",
  },
  {
    titre: "Reportable",
    texte: `${site.policies.cancellation} Chaque séance se déplace librement, dans la limite de validité de la cure.`,
  },
];

export default function RituelsPage() {
  const details = cures.map(detailsCure);
  const economieMax = Math.max(...details.map((d) => d.economie));
  const duos = soins.filter((s) => s.categorie === "duo");

  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="Rituels & cures"
        title="Revenir, c'est là que tout se joue"
        crumbs={[{ name: "Rituels & cures", path: "/rituels" }]}
        lead={
          <p>
            Une peau déshydratée, des jambes lourdes, une mâchoire crispée ne changent pas en une heure. La régularité, si. Nos cures
            regroupent 3 ou 5 séances du même soin, à un prix qui récompense la constance&nbsp;: l&rsquo;économie est écrite noir sur blanc.
          </p>
        }
        aside={
          <dl className="grid max-w-md grid-cols-2 gap-6 border-t hairline pt-6">
            <div>
              <dt className="text-caption text-prune-mute">Économie jusqu&rsquo;à</dt>
              <dd className="mt-1 font-serif text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] leading-none text-sauge-deep">
                <MontantAnime valeur={economieMax} />
              </dd>
            </div>
            <div>
              <dt className="text-caption text-prune-mute">Rituels à deux</dt>
              <dd className="mt-1 font-serif text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] leading-none">{duos.length}</dd>
            </div>
          </dl>
        }
      />

      {/* — Les cures : galets qui se remplissent au scroll ———————————— */}
      <section id="cures" aria-labelledby="cures-titre" className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-7">
            <p className="eyebrow text-argile-deep">Les cures · 3 ou 5 séances</p>
            <h2 id="cures-titre" className="mt-4 font-display text-[clamp(2.2rem,1.3rem+3.6vw,4.8rem)] font-light leading-[0.98] tracking-[-0.045em]">
              Chaque séance remplit la suivante
            </h2>
          </div>
          <p className="max-w-[44ch] self-end text-prune-soft lg:col-span-4 lg:col-start-9">
            Le prix unitaire multiplié par le nombre de séances, barré ; le prix de la cure ; ce que vous économisez ; ce que coûte
            réellement chaque séance. Pas de frais cachés, pas d&rsquo;abonnement.
          </p>
        </div>
        <CuresGalets />
      </section>

      {/* — Comparatif : révélation latérale ——————————————————————— */}
      <section aria-labelledby="comparatif" className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-3">
            <p className="eyebrow text-argile-deep">Comparatif</p>
            <h2 id="comparatif" className="mt-4 font-display text-title font-light tracking-[-0.035em]">
              Séance seule, cure de 3, cure de 5
            </h2>
            <p className="mt-4 max-w-[34ch] text-prune-soft">
              Une séance seule reste parfaite pour découvrir un soin. La cure devient intéressante dès que vous savez que vous reviendrez.
            </p>
          </div>
          <ClipReveal from="left" className="min-w-0 lg:col-span-9">
            <Comparatif />
          </ClipReveal>
        </div>
      </section>

      {/* — Rituels duo : ondulation + parallaxe ———————————————————— */}
      <section id="duo" aria-labelledby="duo-titre" className="shell grain overflow-hidden bg-argile-pale px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="relative z-[2] grid gap-14 lg:grid-cols-12 lg:gap-x-6">
          <div aria-hidden className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[28rem] lg:col-span-5 lg:mx-0 lg:h-[36rem] lg:max-w-none">
            <Parallaxe amplitude={30} className="absolute left-0 top-0 h-[70%] w-[62%]">
              <RippleReveal className="size-full">
                <Matiere kind="huile" className="galet size-full shadow-[var(--shadow-float)]" sizes="(min-width: 1024px) 24vw, 60vw" />
              </RippleReveal>
            </Parallaxe>
            <Parallaxe amplitude={70} className="absolute bottom-0 right-0 h-[62%] w-[56%]">
              <RippleReveal className="size-full" delay={0.25}>
                <Matiere kind="sel" className="galet size-full shadow-[var(--shadow-float)]" sizes="(min-width: 1024px) 22vw, 55vw" />
              </RippleReveal>
            </Parallaxe>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow text-argile-deep">Rituels duo</p>
            <h2 id="duo-titre" className="mt-4 font-display text-[clamp(2.2rem,1.3rem+3.6vw,4.8rem)] font-light leading-[0.98] tracking-[-0.045em]">
              La cabine duo
            </h2>
            <p className="mt-6 max-w-[48ch] text-lead text-prune-soft">
              Deux tables chauffantes côte à côte, une lumière basse, une porte qui ouvre sur la tisanerie. Clémence et Inès accordent leurs
              gestes&nbsp;: vous vivez le même soin, au même moment.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Dans la cabine duo">
              {["Deux tables chauffantes", "Gestes synchronisés", "Huile choisie ensemble", "Tisanerie privatisée 20 min"].map((label) => (
                <li key={label}>
                  <Pill tone="lait">{label}</Pill>
                </li>
              ))}
            </ul>

            <ul className="mt-12 divide-y divide-prune/15 border-y border-prune/15">
              {duos.map((s) => (
                <li key={s.slug} className="group relative py-7">
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                    <div className="min-w-0 max-w-[30ch]">
                      <h3 className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.4rem)] font-light leading-[1.05] tracking-[-0.035em]">
                        <Link
                          href={`/soins/${s.slug}`}
                          className="underline decoration-prune/0 underline-offset-[0.18em] transition-[text-decoration-color] duration-[var(--dur-3)] hover:decoration-prune/40"
                        >
                          {s.nom}
                        </Link>
                      </h3>
                      <p className="mt-2 text-prune-soft">{s.accroche}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-caption text-prune-mute">
                        <Icon name="horloge" size={16} />
                        {formatDuree(s.duree)} de soin, tisanerie comprise ensuite
                      </p>
                    </div>
                    <p className="text-right">
                      <span className="block text-micro text-prune-mute">pour deux</span>
                      <span className="tabular block font-serif text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-none">{formatPrix(s.prix)}</span>
                      <span className="tabular mt-1 block text-caption text-prune-soft">soit {formatPrix(s.prix / 2)} par personne</span>
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button href={`/reserver?soin=${s.slug}`} size="sm" icon="fleche">
                      Réserver à deux
                    </Button>
                    <Button href={`/bons-cadeaux?soin=${s.slug}`} size="sm" variant="ghost" iconLeft="cadeau">
                      Offrir ce rituel
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* — Conditions : filets tracés + composition du titre —————————— */}
      <section aria-labelledby="conditions" className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-4">
            <p className="eyebrow text-argile-deep">Conditions</p>
            <h2 id="conditions" className="mt-4 font-display text-[clamp(2rem,1.2rem+3vw,4rem)] font-light leading-[1] tracking-[-0.045em]">
              <Compose text="Sans astérisque" />
            </h2>
            <p className="mt-5 max-w-[34ch] text-prune-soft">Tout ce qu&rsquo;il faut savoir avant de prendre une cure, en quatre points.</p>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {conditions.map((c, i) => (
              <li key={c.titre} className="pb-8 last:pb-0">
                <Trace delay={i * 0.12} />
                <Glisse delay={0.2 + i * 0.12} className="grid gap-2 pt-6 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
                  <span className="tabular font-serif text-[1.6rem] leading-none text-argile-deep">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[1.45rem] font-light tracking-[-0.03em]">{c.titre}</h3>
                    <p className="mt-2 max-w-[56ch] text-prune-soft">{c.texte}</p>
                  </div>
                </Glisse>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* — CTA : révélation circulaire ——————————————————————————— */}
      <ClipReveal from="center">
        <section className="shell relative overflow-hidden bg-prune px-5 py-16 text-lait sm:px-10 lg:px-16 lg:py-24 [&_:focus-visible]:outline-lait">
          <svg aria-hidden viewBox="0 0 600 600" className="pointer-events-none absolute -bottom-48 -left-40 size-[36rem] text-lait/[0.07]">
            {[70, 130, 190, 250].map((r) => (
              <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="currentColor" strokeWidth="1" />
            ))}
          </svg>
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-6">
            <div className="lg:col-span-7">
              <p className="eyebrow text-argile">Première séance</p>
              <LineReveal
                as="h2"
                text="Commencer une cure, réserver à deux"
                className="mt-4 font-display text-[clamp(2.4rem,1.3rem+4.4vw,5.6rem)] font-light leading-[0.96] tracking-[-0.045em]"
              />
              <p className="mt-6 max-w-[46ch] text-lait/75">
                Réservez la première séance en ligne : nous ouvrons votre cure sur place, le jour même. Pour un rituel duo, un seul créneau
                suffit, la cabine est bloquée pour vous deux.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:col-start-9">
              <Button href="/reserver" variant="lait" size="lg" icon="fleche">
                Réserver
              </Button>
              <Link
                href="/bons-cadeaux"
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-lait/40 px-6 font-display text-[0.95rem] text-lait transition-[background-color,border-color,color,scale] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-lait hover:bg-lait hover:text-prune active:scale-[0.97]"
              >
                <Icon name="cadeau" size={18} />
                Offrir une cure ou un duo
              </Link>
              <a
                href={site.contact.phoneHref}
                className="inline-flex min-h-12 items-center gap-3 px-2 font-display text-[0.95rem] text-lait transition-colors duration-[var(--dur-2)] hover:text-argile"
              >
                <Icon name="telephone" size={18} />
                <span className="tabular">{site.contact.phone}</span>
              </a>
            </div>
          </div>
        </section>
      </ClipReveal>

      <JsonLd data={duos.map((s) => serviceJsonLd(s))} />
    </div>
  );
}
