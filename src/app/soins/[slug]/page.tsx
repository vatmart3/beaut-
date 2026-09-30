import { notFound } from "next/navigation";
import { formatDuree, getCategorie, getSoin, soins } from "@/data/soins";
import { PageIntro } from "@/components/ui/PageIntro";
import { JsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { Deroule } from "@/features/soins/Deroule";
import { CureEncart, FicheAside, FicheCta, FicheSoin, Mains, Precautions, SoinsLies, Variantes } from "@/features/soins/Fiche";
import { ficheMeta } from "@/features/soins/lib";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return soins.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const soin = getSoin(slug);
  if (!soin) return {};
  const { title, description } = ficheMeta(soin);
  return pageMetadata({ title, description, path: `/soins/${soin.slug}` });
}

export default async function SoinPage({ params }: Props) {
  const { slug } = await params;
  const soin = getSoin(slug);
  if (!soin) notFound();
  const cat = getCategorie(soin.categorie);

  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow={soin.signature ? `${cat.label} · signature BRUME` : cat.label}
        title={soin.nom}
        lead={<p>{soin.accroche}</p>}
        crumbs={[
          { name: "Les soins", path: "/soins" },
          { name: soin.nom, path: `/soins/${soin.slug}` },
        ]}
        aside={<FicheAside soin={soin} />}
      />

      <FicheSoin soin={soin} />

      <div>
        <Deroule
          etapes={soin.deroule}
          titre={`${formatDuree(soin.duree)}, geste après geste`}
          duree={formatDuree(soin.duree)}
          intro={
            soin.variantes
              ? "Le protocole de base, tel qu'il se déroule en cabine. Les temps varient selon la formule choisie."
              : "Le protocole tel qu'il se déroule en cabine. L'accueil, le diagnostic et la tisane ne sont pas décomptés du temps de soin."
          }
        />
      </div>

      <Variantes soin={soin} />
      <CureEncart soin={soin} />
      <Precautions soin={soin} />
      <Mains soin={soin} />
      <FicheCta soin={soin} />
      <SoinsLies soin={soin} />

      <JsonLd data={serviceJsonLd(soin)} />
    </div>
  );
}
