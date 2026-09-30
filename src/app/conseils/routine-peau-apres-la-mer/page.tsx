import Link from "next/link";
import { site, siteUrl } from "@/config/site";
import { getSoin, formatDuree, formatPrix } from "@/data/soins";
import { pageMetadata, JsonLd, businessId } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { Button } from "@/components/ui/Button";
import { Matiere } from "@/components/ui/Matiere";
import { ClipReveal } from "@/components/effects/Reveal";
import { SectionTitle } from "@/features/contenu/SectionTitle";
import { FicheRoutine } from "@/features/contenu/conseils/FicheRoutine";
import { auteur, etapes } from "@/features/contenu/conseils/routine";

const path = "/conseils/routine-peau-apres-la-mer";
const titre = "Routine peau après une journée de mer";

export const metadata = pageMetadata({
  title: "Routine peau après la plage : la fiche d'une esthéticienne",
  description:
    "Rinçage, nettoyage doux, hydratation en couches, après-soleil, lèvres, cheveux : la routine du soir après la mer, à imprimer. Offerte par BRUME.",
  path,
});

function jsonLd() {
  const url = `${siteUrl}${path}`;
  const author = { "@type": "Person", name: `${auteur.prenom} ${auteur.nom}`, jobTitle: "Esthéticienne", worksFor: { "@id": businessId } };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      headline: titre,
      description: "La routine du soir d'une esthéticienne après une journée de plage sur le Bassin de Thau : étapes minutées, erreurs à éviter, signaux d'alerte.",
      inLanguage: "fr-FR",
      url,
      mainEntityOfPage: url,
      image: `${url}/opengraph-image`,
      author,
      publisher: { "@id": businessId },
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": `${url}#routine`,
      name: titre,
      inLanguage: "fr-FR",
      totalTime: "PT32M",
      supply: ["Gel lavant surgras sans parfum", "Huile ou baume démaquillant", "Sérum à l'acide hyaluronique", "Crème aux céramides", "Lait après-soleil", "Baume à lèvres sans parfum"].map(
        (name) => ({ "@type": "HowToSupply", name }),
      ),
      step: etapes.map((e, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: `${e.heure} — ${e.titre}`,
        text: e.attention ? `${e.texte} ${e.attention}` : e.texte,
        url: `${url}#fiche-conseil`,
      })),
    },
  ];
}

export default function RoutineApresMerPage() {
  const suites = ["soin-barriere", "hydratation-profonde"].map((slug) => getSoin(slug)).filter((s) => s !== undefined);

  return (
    <div className="frame space-y-3 pt-3">
      <JsonLd data={jsonLd()} />
      <PageIntro
        eyebrow="Fiche conseil offerte"
        title={titre}
        crumbs={[{ name: "Fiche conseil : la peau après la mer", path }]}
        lead={
          <p>
            Sel, soleil, vent de la lagune : le soir, la peau a perdu de l&apos;eau et sa barrière est fragilisée. Voici ce que je conseille à mes
            clientes en rentrant de la plage. À imprimer, à garder dans le sac. Aucune adresse e-mail demandée.
          </p>
        }
      />

      <FicheRoutine />

      {/* ——— Suite douce */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <SectionTitle eyebrow="Quand la peau a récupéré" title="Pour aller plus loin, en cabine" className="lg:col-span-7" />
          <p className="self-end text-prune-soft lg:col-span-4 lg:col-start-9">
            Une fois les rougeurs passées, deux soins prolongent ce que vous avez commencé chez vous. Sans obligation : la routine ci-dessus suffit
            souvent.
          </p>
        </div>
        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {suites.map((s, i) => (
            <ClipReveal key={s.slug} delay={i * 0.15} className="h-full">
              <article className="group relative grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-[var(--radius-card)] bg-voile">
                <Matiere kind={s.matiere === "portrait" ? "lin" : s.matiere} className={i === 0 ? "aspect-[16/9]" : "aspect-[16/9] md:aspect-[16/8]"} />
                <div className="flex flex-col p-6 sm:p-8">
                  <p className="text-[0.8125rem] text-prune-mute">
                    {formatDuree(s.duree)} · <span className="tabular font-serif text-[1rem] text-prune">{formatPrix(s.prix)}</span>
                  </p>
                  <h3 className="mt-2 font-display text-[clamp(1.5rem,1.2rem+1vw,2.1rem)] font-light leading-tight">
                    <Link href={`/soins/${s.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-argile-deep">
                      {s.nom}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-[44ch] text-prune-soft">{s.accroche}</p>
                  <div className="relative z-[1] mt-auto flex flex-wrap gap-2 pt-6">
                    <Button href={`/reserver?soin=${s.slug}`} variant="solid" size="sm" icon="fleche">
                      Réserver ce soin
                    </Button>
                  </div>
                </div>
              </article>
            </ClipReveal>
          ))}
        </div>
        <p className="mt-10 text-[0.9rem] text-prune-soft">
          Une question sur votre peau après l&apos;été ? Appelez-nous au{" "}
          <a href={site.contact.phoneHref} className="underline underline-offset-4">
            {site.contact.phone}
          </a>
          , nous prenons le temps de répondre.
        </p>
      </section>
    </div>
  );
}
