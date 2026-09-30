import { site, mapsUrl } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ClipReveal, Float, RippleReveal } from "@/components/effects/Reveal";
import { SectionTitle } from "@/features/contenu/SectionTitle";
import { ThauMap } from "@/features/contenu/infos/ThauMap";
import { HoursWeek, OpenStatus } from "@/features/contenu/infos/Horaires";
import { ContactForm } from "@/features/contenu/infos/ContactForm";

export const metadata = pageMetadata({
  title: "Accès, horaires & parking · Institut à Balaruc-les-Bains",
  description:
    "BRUME, 4 rue des Sources à Balaruc-les-Bains : plan d'accès depuis Sète, Frontignan et Mèze, stationnement gratuit, horaires, accès PMR et contact.",
  path: "/infos-pratiques",
});

const avantDeVenir = [
  {
    terme: "Annuler",
    texte: `${site.policies.cancellation} Au-delà, le soin peut être dû. Un appel ou un e-mail suffit, sans justification.`,
  },
  { terme: "Régler", texte: `${site.policies.payment} Pas d'acompte, pas de carte bancaire demandée en ligne.` },
  { terme: "Arriver", texte: "Dix minutes avant l'heure, pour vous installer sans courir. Après le soin, la tisanerie est à vous." },
  {
    terme: "Circuler",
    texte: "Institut de plain-pied, accessible aux personnes à mobilité réduite. Dites-le-nous à la réservation : nous adaptons l'installation sur la table.",
  },
];

export default function InfosPratiquesPage() {
  const { address, contact } = site;
  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="Infos pratiques"
        title="Venir à l'institut"
        crumbs={[{ name: "Infos pratiques", path: "/infos-pratiques" }]}
        lead={
          <p>
            {address.street}, {address.postalCode} {address.city}. Au cœur du quartier thermal, à quatre minutes à pied des thermes, sur la rive
            nord-est de l&apos;étang de Thau.
          </p>
        }
        aside={
          <div className="flex flex-col items-start gap-5">
            <OpenStatus />
            <div className="flex flex-wrap gap-2">
              <Button href={mapsUrl} iconLeft="itineraire">
                Itinéraire
              </Button>
              <Button href={contact.phoneHref} variant="outline" iconLeft="telephone">
                {contact.phone}
              </Button>
            </div>
          </div>
        }
      />

      {/* ——— Carte */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <SectionTitle eyebrow="Le plan" title="Entre l'étang et les thermes" className="mb-12 max-w-4xl" />
        <ThauMap>
          <address className="not-italic">
            <p className="font-serif text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] leading-[1.1]">{site.fullName}</p>
            <p className="mt-3 text-lead leading-snug text-prune-soft">
              {address.street}
              <br />
              {address.postalCode} {address.city}
            </p>
            <p className="mt-4 flex flex-col gap-1">
              <a href={contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 underline decoration-prune/25 underline-offset-4 hover:decoration-prune">
                <Icon name="telephone" size={18} />
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center gap-2 underline decoration-prune/25 underline-offset-4 hover:decoration-prune">
                <Icon name="enveloppe" size={18} />
                {contact.email}
              </a>
            </p>
          </address>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button href={mapsUrl} iconLeft="itineraire" size="sm">
              Ouvrir l&apos;itinéraire
            </Button>
            <Button href={contact.phoneHref} variant="soft" iconLeft="telephone" size="sm">
              Appeler
            </Button>
          </div>
        </ThauMap>
      </section>

      {/* ——— Horaires */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTitle eyebrow="Horaires" title="Sur rendez-vous, six jours sur sept" size="md" />
            <div className="mt-6">
              <OpenStatus />
            </div>
            <p className="mt-6 max-w-[36ch] text-prune-soft">
              Le jeudi, nocturne jusqu&apos;à 20 h 30 : pratique après le travail, ou en sortant des thermes.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <HoursWeek />
          </div>
        </div>
      </section>

      {/* ——— Accès & stationnement */}
      <section className="shell grain overflow-hidden bg-sable px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="relative z-[2] grid gap-12 lg:grid-cols-12">
          <SectionTitle eyebrow="Accès & stationnement" title="Se garer sans chercher" className="lg:col-span-5" />
          <ol className="lg:col-span-6 lg:col-start-7">
            {address.access.map((a, i) => (
              <li key={a} className="border-t border-prune/15 first:border-t-0">
                <ClipReveal from="left" delay={i * 0.12} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-5">
                  <span className="tabular font-serif text-[1.6rem] leading-none text-argile-deep">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-lead leading-snug">{a}</p>
                </ClipReveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Avant de venir */}
      <section className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <SectionTitle eyebrow="Avant de venir" title="Ce qu'il est bon de savoir" className="max-w-3xl" />
        <dl className="mt-12 grid gap-x-12 lg:grid-cols-2">
          {avantDeVenir.map((x, i) => (
            <Float key={x.terme} delay={(i % 2) * 0.12} className="grid gap-3 border-t hairline py-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-display text-[clamp(1.5rem,1.1rem+1.2vw,2.1rem)] font-light leading-none tracking-[-0.03em]">{x.terme}</dt>
              <dd className="text-prune-soft">{x.texte}</dd>
            </Float>
          ))}
        </dl>
      </section>

      {/* ——— Contact */}
      <section id="contact" className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTitle eyebrow="Contact" title="Une question avant de réserver ?" size="md" />
            <p className="mt-6 text-prune-soft">
              Écrivez-nous : nous répondons {contact.responseTime}. Pour un rendez-vous dans la journée, le téléphone reste le plus rapide.
            </p>
            <p className="mt-6">
              <a href={contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 font-serif text-[1.6rem] underline decoration-prune/20 underline-offset-[6px] hover:decoration-prune">
                {contact.phone}
              </a>
            </p>
          </div>
          <RippleReveal className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </RippleReveal>
        </div>
      </section>
    </div>
  );
}
