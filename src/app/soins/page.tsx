import { Suspense } from "react";
import { site } from "@/config/site";
import { formatPrix, prixDepart, soins } from "@/data/soins";
import { cures, detailsCure } from "@/data/rituels";
import { PageIntro } from "@/components/ui/PageIntro";
import { Button } from "@/components/ui/Button";
import { Compose } from "@/components/effects/LineReveal";
import { ClipReveal, Float } from "@/components/effects/Reveal";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { CarteSoins, CarteSoinsStatique } from "@/features/soins/CarteSoins";
import { carteJsonLd } from "@/features/soins/lib";
import { MontantAnime } from "@/features/soins/effets";

export const metadata = pageMetadata({
  title: "Carte des soins · institut à Balaruc-les-Bains | BRUME",
  description:
    "Soins visage, gommage au sel, argile, modelages, épilations, mains et pieds, rituels duo à Balaruc-les-Bains. Durées réelles, prix de 9 à 230 €.",
  path: "/soins",
});

export default function SoinsPage() {
  const prix = soins.flatMap((s) => (s.variantes ?? [s]).map((v) => v.prix));
  const economieMax = Math.max(...cures.map((c) => detailsCure(c).economie));
  const decouverte = soins.find((s) => s.slug === "decouverte-visage");

  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="La carte"
        title="Carte des soins"
        crumbs={[{ name: "Les soins", path: "/soins" }]}
        lead={
          <>
            <p>
              Tous nos soins sont faits à la main, par l&rsquo;une de nos deux praticiennes. Les durées indiquées sont celles passées sur la
              table&nbsp;; l&rsquo;accueil et la tisane viennent en plus, sans supplément.
            </p>
            <p className="mt-4 text-body text-prune-mute">Filtrez par famille, par durée ou par budget. Chaque ligne ouvre la fiche complète du soin.</p>
          </>
        }
        aside={
          <dl className="grid max-w-md grid-cols-3 gap-4 border-t hairline pt-6">
            <div>
              <dt className="text-caption text-prune-mute">Soins</dt>
              <dd className="tabular mt-1 font-serif text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-none">{soins.length}</dd>
            </div>
            <div>
              <dt className="text-caption text-prune-mute">Praticiennes</dt>
              <dd className="tabular mt-1 font-serif text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-none">2</dd>
            </div>
            <div>
              <dt className="text-caption text-prune-mute">De … à</dt>
              <dd className="tabular mt-1 font-serif text-[clamp(1.2rem,1rem+0.8vw,1.6rem)] leading-tight">
                {formatPrix(Math.min(...prix))}
                <br />
                {formatPrix(Math.max(...prix))}
              </dd>
            </div>
          </dl>
        }
      />

      <section aria-labelledby="carte" className="shell px-3 py-10 sm:px-8 lg:px-12 lg:py-16">
        <h2 id="carte" className="sr-only">
          La carte, filtrable par famille, durée et budget
        </h2>
        <Suspense fallback={<CarteSoinsStatique />}>
          <CarteSoins />
        </Suspense>
      </section>

      <section aria-labelledby="hesiter" className="shell overflow-hidden px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-6">
          <div className="lg:col-span-6">
            <p className="eyebrow text-argile-deep">Conseil</p>
            <h2 id="hesiter" className="mt-4 font-display text-[clamp(2.2rem,1.3rem+3.6vw,4.8rem)] font-light leading-[0.98] tracking-[-0.045em]">
              <Compose text="Vous hésitez entre deux soins ?" />
            </h2>
            <Float delay={0.2}>
              <p className="mt-6 max-w-[46ch] text-lead text-prune-soft">
                Appelez-nous : Clémence ou Inès vous répondent entre deux rendez-vous. Si c&rsquo;est votre premier soin chez nous, le soin
                découverte est fait pour ça&nbsp;: quarante-cinq minutes pour comprendre votre peau, et une fiche routine écrite à la main.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href={site.contact.phoneHref} iconLeft="telephone" variant="outline">
                  {site.contact.phone}
                </Button>
                {decouverte ? (
                  <Button href={`/soins/${decouverte.slug}`} icon="fleche" variant="ghost">
                    Soin découverte · {formatPrix(prixDepart(decouverte))}
                  </Button>
                ) : null}
              </div>
            </Float>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:col-start-8 lg:grid-cols-1">
            <ClipReveal from="left" className="rounded-[var(--radius-card)] bg-sauge-pale p-7 sm:p-8">
              <p className="eyebrow text-sauge-deep">Rituels &amp; cures</p>
              <p className="mt-4 font-display text-[1.5rem] font-light leading-tight tracking-[-0.03em]">
                Jusqu&rsquo;à <span className="font-serif text-sauge-deep"><MontantAnime valeur={economieMax} /></span> d&rsquo;économie
                en cure de 5&nbsp;séances.
              </p>
              <Button href="/rituels" variant="ghost" icon="fleche" className="-ml-4 mt-4">
                Voir les cures
              </Button>
            </ClipReveal>
            <ClipReveal from="left" delay={0.15} className="rounded-[var(--radius-card)] bg-argile-pale p-7 sm:p-8">
              <p className="eyebrow text-argile-deep">Offrir</p>
              <p className="mt-4 font-display text-[1.5rem] font-light leading-tight tracking-[-0.03em]">
                Chaque soin de la carte existe en bon cadeau, valable {site.policies.giftValidityMonths}&nbsp;mois.
              </p>
              <Button href="/bons-cadeaux" variant="ghost" icon="fleche" className="-ml-4 mt-4">
                Composer un bon cadeau
              </Button>
            </ClipReveal>
          </div>
        </div>
      </section>

      <JsonLd data={carteJsonLd()} />
    </div>
  );
}
