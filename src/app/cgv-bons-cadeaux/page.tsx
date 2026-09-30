import Link from "next/link";
import type { ReactNode } from "react";
import { PageIntro } from "@/components/ui/PageIntro";
import { ClipReveal, Float, RippleReveal } from "@/components/effects/Reveal";
import { fullAddress, site, siteUrl } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { CgvToc } from "@/features/bons-cadeaux/CgvToc";

export const metadata = pageMetadata({
  title: "CGV des bons cadeaux · BRUME, Balaruc-les-Bains",
  description:
    "Conditions générales de vente des bons cadeaux BRUME : validité 12 mois, paiement, utilisation, rétractation, réclamations et médiation.",
  path: "/cgv-bons-cadeaux",
});

const { giftMin, giftMax, giftValidityMonths } = site.policies;

/** Champ à compléter par l'exploitante : bien visible, entre crochets. */
function A({ children }: { children: ReactNode }) {
  return <mark className="rounded-[6px] bg-argile-pale px-1.5 py-0.5 text-argile-deep [box-decoration-break:clone]">{children}</mark>;
}

/** Affiche une valeur de `site.legal` : surlignée si elle est encore à compléter. */
function L({ v }: { v: string }) {
  return v.trim().startsWith("[") ? <A>{v}</A> : <>{v}</>;
}

const P = ({ children }: { children: ReactNode }) => <p className="mt-4 text-prune-soft first:mt-0">{children}</p>;
const Ul = ({ children }: { children: ReactNode }) => (
  <ul className="mt-4 space-y-2.5 text-prune-soft [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.7em] [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-argile [&>li]:before:content-['']">
    {children}
  </ul>
);
const lien = "underline decoration-prune/30 underline-offset-4 hover:decoration-prune";

const articles: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "vendeur",
    title: "Vendeur",
    body: (
      <>
        <P>Les bons cadeaux sont vendus par :</P>
        <ClipReveal from="left" className="mt-5">
          <dl className="grid gap-x-8 gap-y-4 rounded-[var(--radius-card)] bg-voile p-6 text-[0.95rem] sm:grid-cols-2 sm:p-8">
            {[
              ["Enseigne", site.fullName],
              ["Exploitante", site.legal.owner],
              ["Forme juridique", site.legal.status],
              ["SIRET", site.legal.siret],
              ["Immatriculation", site.legal.rcs],
              ["TVA", site.legal.vat],
              ["Adresse", fullAddress],
              ["Contact", `${site.contact.phone} · ${site.contact.email}`],
              ["Assurance RC professionnelle", site.legal.insurance],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow text-prune-mute">{k}</dt>
                <dd className="mt-1 text-prune">
                  <L v={v} />
                </dd>
              </div>
            ))}
          </dl>
        </ClipReveal>
        <P>Ci-après « l&apos;institut ». La personne qui achète le bon est désignée « l&apos;acheteur », celle qui l&apos;utilise « le bénéficiaire ».</P>
      </>
    ),
  },
  {
    id: "objet",
    title: "Objet",
    body: (
      <>
        <P>
          Les présentes conditions régissent la vente des bons cadeaux {site.name}, commandés sur le site {siteUrl.replace(/^https?:\/\//, "")}, par téléphone ou à
          l&apos;institut, ainsi que leur utilisation. Elles s&apos;appliquent à l&apos;exclusion de toute autre condition.
        </P>
        <P>
          L&apos;acheteur les accepte en cochant la case prévue avant de valider sa demande. Elles sont consultables à tout moment sur cette page et peuvent être
          enregistrées ou imprimées. Les conditions applicables sont celles en vigueur à la date de la commande.
        </P>
      </>
    ),
  },
  {
    id: "offre",
    title: "Les bons proposés",
    body: (
      <>
        <P>Deux formes de bons sont proposées :</P>
        <Ul>
          <li>
            <strong className="font-medium text-prune">Le bon à montant libre</strong>, d&apos;une valeur comprise entre {giftMin} € et {giftMax} € TTC, en euros
            entiers, utilisable pour tout soin de la carte{" "}
            <A>[et pour les produits vendus à l&apos;institut — à confirmer]</A>.
          </li>
          <li>
            <strong className="font-medium text-prune">Le bon « soin »</strong>, correspondant à un soin précis de la carte (et, le cas échéant, à une formule
            de ce soin), au prix affiché le jour de l&apos;achat.
          </li>
        </Ul>
        <P>
          Chaque bon porte un code unique, le prénom du bénéficiaire, celui de l&apos;acheteur, un message facultatif et sa date de fin de validité. Il est
          remis au choix sous forme de fichier PDF à imprimer, par e-mail au bénéficiaire à la date choisie, ou imprimé et remis à l&apos;institut.
        </P>
      </>
    ),
  },
  {
    id: "prix",
    title: "Prix",
    body: (
      <>
        <P>
          Les prix sont indiqués en euros, toutes taxes comprises. <L v={site.legal.vat} />. Aucun frais de dossier ni d&apos;envoi n&apos;est facturé.
        </P>
        <P>
          Le prix d&apos;un bon « soin » est celui du soin au jour de l&apos;achat. Si le tarif du soin augmente pendant la durée de validité du bon, le
          bénéficiaire n&apos;a aucun complément à régler pour ce soin.
        </P>
      </>
    ),
  },
  {
    id: "commande",
    title: "Commande",
    body: (
      <>
        <P>Sur le site, la commande se déroule ainsi :</P>
        <Ul>
          <li>choix du bon (montant ou soin), personnalisation (prénoms, message, motif) et mode de remise ;</li>
          <li>saisie des coordonnées de l&apos;acheteur (e-mail et téléphone) ;</li>
          <li>vérification du récapitulatif et de l&apos;aperçu, acceptation des présentes conditions, puis validation.</li>
        </Ul>
        <P>
          La validation réserve le code au nom de l&apos;acheteur et déclenche l&apos;envoi d&apos;un e-mail de confirmation récapitulant la commande. La vente
          est conclue à la réception du règlement (article 6).
        </P>
      </>
    ),
  },
  {
    id: "paiement",
    title: "Paiement",
    body: (
      <>
        <P>
          Aucun paiement n&apos;est demandé en ligne. Après la validation, l&apos;institut contacte l&apos;acheteur {site.contact.responseTime} par téléphone
          pour convenir du règlement, qui s&apos;effectue :
        </P>
        <Ul>
          <li>à l&apos;institut, par carte bancaire, en espèces ou par chèque ;</li>
          <li>
            à distance, <A>[modalité à compléter — ex. lien de paiement sécurisé envoyé par e-mail]</A>.
          </li>
        </Ul>
        <P>
          Le bon est activé dès réception du paiement intégral. Un bon non réglé n&apos;est pas valable. Sans règlement dans un délai de{" "}
          <A>[15 jours]</A> après la demande, la réservation du code est annulée et l&apos;envoi programmé éventuel est supprimé ; l&apos;acheteur en est
          informé par e-mail.
        </P>
      </>
    ),
  },
  {
    id: "remise",
    title: "Remise du bon",
    body: (
      <>
        <Ul>
          <li>
            <strong className="font-medium text-prune">PDF</strong> : le fichier est téléchargé par l&apos;acheteur au moment de la validation ; il peut aussi
            lui être renvoyé sur demande.
          </li>
          <li>
            <strong className="font-medium text-prune">E-mail</strong> : le bon est envoyé au bénéficiaire à 9 h (heure de Paris) le jour choisi, dans les{" "}
            30 jours suivant la commande. Si le paiement n&apos;est pas intervenu à cette date, l&apos;envoi est reporté d&apos;un commun accord.
          </li>
          <li>
            <strong className="font-medium text-prune">À l&apos;institut</strong> : le bon imprimé est remis dans une enveloppe en papier ensemencé, aux heures
            d&apos;ouverture.
          </li>
        </Ul>
        <P>
          L&apos;acheteur est responsable de l&apos;exactitude de l&apos;adresse e-mail du bénéficiaire. L&apos;institut ne saurait être tenu responsable
          d&apos;un e-mail non reçu du fait d&apos;une adresse erronée ou d&apos;un filtre anti-indésirables ; le bon reste alors utilisable avec son code.
        </P>
      </>
    ),
  },
  {
    id: "validite",
    title: "Durée de validité",
    body: (
      <>
        <P>
          Le bon est valable {giftValidityMonths} mois à compter de la date d&apos;achat. La date limite figure sur le bon. Le soin doit être réalisé au plus
          tard à cette date.
        </P>
        <P>
          Passé ce délai, le bon ne peut plus être utilisé et ne donne lieu à aucun remboursement, même partiel. Toute prolongation relève d&apos;un geste
          commercial laissé à l&apos;appréciation de l&apos;institut.
        </P>
      </>
    ),
  },
  {
    id: "utilisation",
    title: "Utilisation",
    body: (
      <>
        <Ul>
          <li>
            Le bon est utilisable uniquement à l&apos;institut, {fullAddress}, sur rendez-vous. Le code est communiqué lors de la réservation, en ligne ou par
            téléphone.
          </li>
          <li>
            <strong className="font-medium text-prune">Bon à montant libre</strong> : il peut être utilisé en une ou plusieurs fois, jusqu&apos;à épuisement de
            sa valeur et dans sa durée de validité. Le solde restant est indiqué au bénéficiaire à chaque passage. Si la prestation dépasse le solde, la
            différence est réglée sur place.
          </li>
          <li>
            <strong className="font-medium text-prune">Bon « soin »</strong> : il peut être échangé contre un autre soin de la carte. La différence de prix est
            réglée sur place ou, si le soin choisi est moins cher, conservée en avoir sur le même code, jusqu&apos;à la même date limite.
          </li>
          <li>
            Les conditions d&apos;annulation des rendez-vous s&apos;appliquent : {site.policies.cancellation.toLowerCase()} En cas d&apos;absence ou
            d&apos;annulation plus tardive, la prestation réservée peut être décomptée du bon.
          </li>
          <li>
            Le bon n&apos;est pas cumulable avec une autre offre promotionnelle, sauf mention contraire. <A>[à confirmer]</A>
          </li>
        </Ul>
      </>
    ),
  },
  {
    id: "especes",
    title: "Remboursement et espèces",
    body: (
      <P>
        En dehors de l&apos;exercice du droit de rétractation (article 12), le bon n&apos;est ni remboursable, ni échangeable contre des espèces, en tout ou
        partie. Aucun rendu de monnaie n&apos;est effectué sur la valeur du bon.
      </P>
    ),
  },
  {
    id: "perte",
    title: "Perte, vol, utilisation par un tiers",
    body: (
      <>
        <P>
          Le code est enregistré au nom de l&apos;acheteur. En cas de perte du bon ou de l&apos;e-mail, l&apos;acheteur ou le bénéficiaire peut demander à
          l&apos;institut de lui communiquer à nouveau le code, sur présentation d&apos;éléments permettant d&apos;identifier la commande (nom, e-mail,
          date).
        </P>
        <P>
          Le bon est utilisable par toute personne qui en présente le code. L&apos;institut ne peut être tenu responsable de son utilisation par un tiers
          avant qu&apos;une perte ou un vol lui ait été signalé ; dès le signalement, le code est bloqué et un nouveau code est émis pour la valeur restante.
        </P>
      </>
    ),
  },
  {
    id: "retractation",
    title: "Droit de rétractation",
    body: (
      <>
        <P>
          Pour un bon acheté à distance (site, téléphone, e-mail), l&apos;acheteur consommateur dispose d&apos;un délai de <strong className="font-medium text-prune">14 jours</strong>{" "}
          à compter de la conclusion du contrat pour se rétracter, sans avoir à se justifier (articles L221-18 et suivants du Code de la consommation).
        </P>
        <P>
          Pour l&apos;exercer, il suffit d&apos;adresser avant l&apos;expiration de ce délai une déclaration dénuée d&apos;ambiguïté par e-mail à{" "}
          <a href={`mailto:${site.contact.email}`} className={lien}>
            {site.contact.email}
          </a>{" "}
          ou par courrier à l&apos;adresse de l&apos;institut, ou d&apos;utiliser le formulaire type figurant en annexe. L&apos;institut rembourse la
          totalité des sommes versées au plus tard dans les 14 jours suivant la réception de la demande, par le même moyen de paiement, sauf accord
          contraire, et sans frais.
        </P>
        <P>
          <strong className="font-medium text-prune">Limite.</strong> Si le bénéficiaire utilise le bon pendant le délai de rétractation, le soin est
          réalisé à la demande expresse du consommateur, qui reconnaît qu&apos;il perd son droit de rétractation pour la prestation pleinement exécutée
          (article L221-28, 1°). Pour un bon à montant libre partiellement utilisé, seul le solde non utilisé est remboursable (article L221-25).
        </P>
        <P>Le droit de rétractation ne s&apos;applique pas aux bons achetés et réglés sur place, à l&apos;institut.</P>
      </>
    ),
  },
  {
    id: "donnees",
    title: "Données personnelles",
    body: (
      <P>
        Les données saisies (prénoms, e-mails, téléphone, message) servent uniquement à établir, envoyer et gérer le bon, et à convenir du règlement. Elles
        ne sont ni revendues ni utilisées à des fins publicitaires, et sont conservées <A>[durée à compléter — ex. 3 ans après la fin de validité du bon]</A>.
        Vous disposez d&apos;un droit d&apos;accès, de rectification et d&apos;effacement : voir la{" "}
        <Link href="/confidentialite" className={lien}>
          politique de confidentialité
        </Link>
        .
      </P>
    ),
  },
  {
    id: "reclamations",
    title: "Réclamations",
    body: (
      <P>
        Toute réclamation peut être adressée à l&apos;institut par e-mail à{" "}
        <a href={`mailto:${site.contact.email}`} className={lien}>
          {site.contact.email}
        </a>
        , par téléphone au{" "}
        <a href={site.contact.phoneHref} className={lien}>
          {site.contact.phone}
        </a>{" "}
        ou par courrier au {fullAddress}. Nous y répondons {site.contact.responseTime} et recherchons toujours une solution amiable.
      </P>
    ),
  },
  {
    id: "mediation",
    title: "Médiation",
    body: (
      <P>
        Si la réclamation écrite n&apos;a pas abouti, le consommateur peut recourir gratuitement au médiateur de la consommation dont relève l&apos;institut
        (articles L612-1 et suivants du Code de la consommation) : <L v={site.legal.mediator} />. La saisine du médiateur n&apos;est possible qu&apos;après une
        réclamation écrite préalable auprès de l&apos;institut, et dans un délai d&apos;un an à compter de celle-ci.
      </P>
    ),
  },
  {
    id: "loi",
    title: "Droit applicable",
    body: (
      <P>
        Les présentes conditions sont soumises au droit français. À défaut de résolution amiable, tout litige relève des juridictions françaises
        compétentes ; le consommateur peut saisir, à son choix, la juridiction du lieu où il demeurait au moment de la conclusion du contrat ou celle du
        lieu d&apos;exécution de la prestation.
      </P>
    ),
  },
];

const toc = [...articles.map((a) => ({ id: a.id, title: a.title })), { id: "annexe", title: "Annexe : formulaire de rétractation" }];

export default function CgvBonsCadeauxPage() {
  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="Informations légales"
        title="Conditions de vente des bons cadeaux"
        crumbs={[
          { name: "Bons cadeaux", path: "/bons-cadeaux" },
          { name: "Conditions de vente", path: "/cgv-bons-cadeaux" },
        ]}
        lead={
          <>
            <p>
              Validité de {giftValidityMonths} mois, paiement à l&apos;institut ou à distance, utilisation en une ou plusieurs fois, rétractation : tout ce qui
              encadre un bon cadeau {site.name}, écrit pour être lu.
            </p>
            <p className="mt-4 text-caption text-prune-mute">
              Version en vigueur au <A>[date de mise en ligne]</A>. Les passages <A>[entre crochets]</A> sont à compléter par l&apos;institut.
            </p>
          </>
        }
      />

      <section aria-label="Articles des conditions générales de vente" className="shell px-5 py-14 sm:px-10 lg:px-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <CgvToc items={toc} />
          </div>

          <div className="min-w-0 lg:col-span-7 lg:col-start-6">
            {articles.map((a, i) => (
              <Float key={a.id} y={18}>
                <article id={a.id} aria-labelledby={`${a.id}-t`} className="scroll-mt-28 border-t hairline py-10 first:border-t-0 first:pt-0">
                  <h2 id={`${a.id}-t`} className="flex items-baseline gap-4 font-display text-[clamp(1.35rem,1.1rem+0.9vw,1.9rem)] font-light tracking-[-0.03em]">
                    <span className="font-serif text-[0.8em] text-argile-deep tabular">{String(i + 1).padStart(2, "0")}</span>
                    <span>{a.title}</span>
                  </h2>
                  <div className="mt-5 max-w-[68ch]">{a.body}</div>
                </article>
              </Float>
            ))}

            <RippleReveal>
              <article id="annexe" aria-labelledby="annexe-t" className="scroll-mt-28 rounded-[var(--radius-card)] bg-voile p-6 sm:p-10">
                <p className="eyebrow text-argile-deep">Annexe</p>
                <h2 id="annexe-t" className="mt-3 font-display text-[clamp(1.35rem,1.1rem+0.9vw,1.9rem)] font-light tracking-[-0.03em]">
                  Formulaire de rétractation
                </h2>
                <p className="mt-3 text-caption text-prune-mute">
                  À compléter et renvoyer uniquement si vous souhaitez vous rétracter (article R221-1 du Code de la consommation).
                </p>
                <div className="mt-6 space-y-3 border-l-2 border-argile pl-5 text-prune-soft">
                  <p>
                    À l&apos;attention de {site.fullName}, {fullAddress} — {site.contact.email} :
                  </p>
                  <p>Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bon cadeau ci-dessous :</p>
                  <p>Code du bon : …………………… — Commandé le : ……………………</p>
                  <p>Nom de l&apos;acheteur : ……………………………………</p>
                  <p>Adresse de l&apos;acheteur : ……………………………………</p>
                  <p>Signature (uniquement en cas de notification sur papier) : ……………………</p>
                  <p>Date : ……………………</p>
                </div>
              </article>
            </RippleReveal>

            <p className="mt-10 text-caption text-prune-mute">
              Voir aussi les{" "}
              <Link href="/mentions-legales" className={lien}>
                mentions légales
              </Link>{" "}
              et la page{" "}
              <Link href="/bons-cadeaux" className={lien}>
                bons cadeaux
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
