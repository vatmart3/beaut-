import { site } from "@/config/site";
import { faq } from "@/data/faq";
import { pageMetadata, JsonLd, faqJsonLd } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { Button } from "@/components/ui/Button";
import { RippleReveal } from "@/components/effects/Reveal";
import { LineReveal } from "@/components/effects/LineReveal";
import { FaqExplorer } from "@/features/contenu/faq/FaqExplorer";

export const metadata = pageMetadata({
  title: "Questions fréquentes · Institut BRUME, Balaruc-les-Bains",
  description:
    "Réserver, annuler, grossesse, cure thermale, bons cadeaux, stationnement : les réponses avant votre premier soin chez BRUME, à Balaruc-les-Bains.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="frame space-y-3 pt-3">
      <JsonLd data={faqJsonLd(faq)} />
      <PageIntro
        eyebrow="Questions fréquentes"
        title="Avant votre premier soin"
        crumbs={[{ name: "Questions fréquentes", path: "/faq" }]}
        lead={
          <p>
            Ce que l&apos;on nous demande le plus souvent, au téléphone ou à l&apos;accueil. Si votre question n&apos;y est pas, posez-la : nous
            répondons {site.contact.responseTime}.
          </p>
        }
      />

      <section aria-label="Toutes les questions" className="shell px-5 py-12 sm:px-10 lg:px-16 lg:py-20">
        <FaqExplorer items={faq} />
      </section>

      <section className="shell grain overflow-hidden bg-prune px-5 py-16 text-lait sm:px-10 lg:px-16 lg:py-24">
        <div className="relative z-[2] grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-lait/60">Et maintenant</p>
            <LineReveal
              as="h2"
              text="Le plus simple reste d'essayer."
              className="mt-4 font-display text-[clamp(2.2rem,1.3rem+3.6vw,5rem)] font-light leading-[0.98] tracking-[-0.04em]"
            />
          </div>
          <RippleReveal className="lg:col-span-5">
            <p className="text-lead text-lait/80">Réservez en ligne en trois étapes, ou appelez-nous aux heures d&apos;ouverture.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button href="/reserver" variant="lait" icon="fleche" size="lg">
                Réserver un soin
              </Button>
              <a
                href={site.contact.phoneHref}
                className="inline-flex min-h-14 items-center rounded-full border border-lait/40 px-7 font-display transition-colors duration-[var(--dur-2)] hover:border-lait hover:bg-lait hover:text-prune sm:min-h-16"
              >
                {site.contact.phone}
              </a>
            </div>
          </RippleReveal>
        </div>
      </section>
    </div>
  );
}
