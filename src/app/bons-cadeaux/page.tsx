import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { Counter, RippleReveal } from "@/components/effects/Reveal";
import { LineReveal } from "@/components/effects/LineReveal";
import { site } from "@/config/site";
import { faq } from "@/data/faq";
import { formatDuree, formatPrix, prixDepart, soins, type Soin } from "@/data/soins";
import { JsonLd, giftProductJsonLd, pageMetadata } from "@/lib/seo";
import { GiftConfigurator } from "@/features/bons-cadeaux/GiftConfigurator";
import { OccasionNote } from "@/features/bons-cadeaux/OccasionNote";
import { BudgetItem, BudgetRow, DrawnList, FaqList } from "@/features/bons-cadeaux/sections";

export const metadata = pageMetadata({
  title: "Bon cadeau soin & spa à Balaruc-les-Bains, près de Sète",
  description: `Offrez un soin BRUME : montant libre de ${site.policies.giftMin} à ${site.policies.giftMax} € ou soin au choix, à imprimer ou envoyé par e-mail le jour voulu. Valable 12 mois.`,
  path: "/bons-cadeaux",
});

const { giftMin, giftMax, giftValidityMonths } = site.policies;

const offrables = soins.filter((s) => s.categorie !== "epilations");
const bandes: { label: string; note: string; items: Soin[] }[] = [
  {
    label: "Moins de 50 €",
    note: "Un soin court, précis, qui se glisse dans une pause déjeuner.",
    items: offrables.filter((s) => s.personnes !== 2 && prixDepart(s) < 50),
  },
  {
    label: "De 50 à 90 €",
    note: "L'heure pleine : un soin visage complet ou un modelage.",
    items: offrables.filter((s) => s.personnes !== 2 && prixDepart(s) >= 50 && prixDepart(s) < 90),
  },
  {
    label: "Au-delà de 90 €",
    note: "Les soins longs, pour quelqu'un qui n'a jamais le temps.",
    items: offrables.filter((s) => s.personnes !== 2 && prixDepart(s) >= 90),
  },
  {
    label: "Pour deux",
    note: "La cabine duo : deux tables, deux praticiennes, le même tempo.",
    items: offrables.filter((s) => s.personnes === 2),
  },
];

const faqCadeaux = [
  ...faq.filter((x) => x.theme === "cadeaux").map((x) => ({ q: x.q, r: x.r })),
  {
    q: "Comment se passe le règlement ?",
    r: `Il n'y a pas de paiement en ligne. Après votre demande, nous vous appelons ${site.contact.responseTime} pour convenir du règlement, ou vous le faites à l'institut : carte bancaire, espèces ou chèque. Le bon est activé dès réception.`,
  },
  {
    q: "Comment la personne réserve-t-elle son soin ?",
    r: `En ligne sur la page Réserver ou au ${site.contact.phone}, en indiquant le code du bon. Il n'y a rien à imprimer pour venir : le code suffit.`,
  },
  {
    q: "La personne habite loin de Balaruc-les-Bains. Est-ce raisonnable ?",
    r: "Le bon s'utilise uniquement à l'institut, au 4 rue des Sources. Beaucoup de nos clientes viennent de Sète, Frontignan ou Mèze, et nombre de bons sont offerts à des curistes pendant leur séjour aux thermes.",
  },
];

export default function BonsCadeauxPage() {
  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="Bons cadeaux · à imprimer ou à envoyer"
        title="Une heure à soi, à offrir"
        crumbs={[{ name: "Bons cadeaux", path: "/bons-cadeaux" }]}
        lead={
          <>
            <p>
              Un montant libre de {giftMin} à {giftMax} € ou un soin précis, une carte au motif de votre choix, à imprimer tout de suite ou à envoyer par e-mail
              le jour voulu, à 9 h.
            </p>
            <p className="mt-4 text-body">
              Valable {giftValidityMonths} mois à l&apos;institut de {site.address.city}. Aucun paiement en ligne : nous vous appelons pour le règlement, ou vous
              réglez sur place.
            </p>
          </>
        }
        aside={<OccasionNote />}
      />

      <GiftConfigurator />

      {/* ————————————————————————— Réassurance */}
      <section aria-label="Conditions des bons cadeaux" className="shell overflow-hidden px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="eyebrow text-argile-deep">Les conditions, sans détour</p>
            <LineReveal as="h2" text="Un bon qui laisse le temps" className="mt-3 max-w-[14ch] font-display text-title font-light tracking-[-0.035em]" />
            <p className="mt-10 flex items-baseline gap-3 lg:mt-16">
              <Counter to={giftValidityMonths} className="font-serif text-mega leading-[0.85]" duration={1.8} />
              <span className="font-display text-title font-light tracking-[-0.03em]">mois</span>
            </p>
            <p className="mt-4 max-w-[34ch] text-prune-soft">
              pour utiliser le bon, à compter du jour de l&apos;achat. La date limite est imprimée au verso, à côté du code.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
            <DrawnList
              items={[
                {
                  icon: "retourner",
                  title: "Échangeable contre un autre soin",
                  text: "Un bon « soin » peut servir pour n'importe quel soin de la carte. La différence se règle sur place, ou reste en avoir sur le même code.",
                },
                {
                  icon: "sablier-2",
                  title: "Utilisable en plusieurs fois",
                  text: "Un bon à montant libre se consomme soin après soin, jusqu'à épuisement. Le solde vous est indiqué à chaque passage.",
                },
                {
                  icon: "feuille",
                  title: "Une enveloppe en papier ensemencé",
                  text: "Vous préférez un objet à remettre en main propre ? Passez le retirer à l'institut : le bon imprimé, dans une enveloppe qui se plante et donne des fleurs des champs.",
                },
                {
                  icon: "main",
                  title: "Le code suffit",
                  text: (
                    <>
                      Bon oublié ou égaré : le code est enregistré à votre nom, nous le retrouvons. Non remboursable, il n&apos;est pas échangeable contre des espèces —{" "}
                      <Link href="/cgv-bons-cadeaux" className="underline decoration-prune/30 underline-offset-4 hover:decoration-prune">
                        conditions de vente complètes
                      </Link>
                      .
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ————————————————————————— Idées par budget */}
      <section aria-labelledby="idees-titre" className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-argile-deep">Idées de cadeaux</p>
            <h2 id="idees-titre" className="mt-3 font-display text-display font-light tracking-[-0.045em]">
              Par budget
            </h2>
          </div>
          <p className="max-w-[40ch] text-prune-soft lg:col-span-4 lg:col-start-9">
            Chaque soin a sa fiche détaillée : déroulé minute par minute, produits, précautions. « Offrir » le présélectionne dans la carte ci-dessus.
          </p>
        </div>
        <RippleReveal className="mt-12">
          {bandes
            .filter((b) => b.items.length)
            .map((b, i) => (
              <BudgetRow key={b.label} label={b.label} note={b.note} index={i}>
                {b.items.map((s) => (
                  <BudgetItem
                    key={s.slug}
                    slug={s.slug}
                    nom={s.nom}
                    detail={s.variantes ? `${s.variantes.length} formules` : formatDuree(s.duree)}
                    prix={`${s.variantes ? "dès " : ""}${formatPrix(prixDepart(s))}`}
                  />
                ))}
              </BudgetRow>
            ))}
        </RippleReveal>
      </section>

      {/* ————————————————————————— Questions */}
      <section aria-label="Questions fréquentes sur les bons cadeaux" className="shell px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-argile-deep">Avant d&apos;offrir</p>
            <LineReveal as="h2" text="Questions fréquentes" className="mt-3 font-display text-title font-light tracking-[-0.035em]" />
            <p className="mt-5 max-w-[34ch] text-prune-soft">
              Une autre question ?{" "}
              <a href={site.contact.phoneHref} className="whitespace-nowrap underline decoration-prune/30 underline-offset-4 hover:decoration-prune">
                {site.contact.phone}
              </a>
              , du mardi au samedi. Ou toutes les réponses sur la page{" "}
              <Link href="/faq" className="underline decoration-prune/30 underline-offset-4 hover:decoration-prune">
                questions
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <FaqList items={faqCadeaux} />
            <p className="mt-8 text-caption text-prune-mute">
              Les bons cadeaux sont régis par nos{" "}
              <Link href="/cgv-bons-cadeaux" className="underline underline-offset-4 hover:text-prune">
                conditions générales de vente
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <JsonLd data={giftProductJsonLd()} />
    </div>
  );
}
