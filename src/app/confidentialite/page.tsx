import Link from "next/link";
import { site, fullAddress } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { CookieSettingsButton } from "@/components/layout/CookieBanner";
import { LegalLayout, type LegalSection } from "@/features/contenu/legal/LegalLayout";
import { Champ } from "@/features/contenu/legal/Champ";

export const metadata = pageMetadata({
  title: "Confidentialité & données personnelles · BRUME",
  description:
    "Ce que nos formulaires collectent, pourquoi, combien de temps, qui les reçoit, et comment exercer vos droits RGPD. Aucun traceur sans votre accord.",
  path: "/confidentialite",
});

const MAJ = "30 septembre 2026";

const traitements = [
  {
    formulaire: "Réservation",
    donnees: "Prénom, nom, téléphone, e-mail ; soin, praticienne, date et heure souhaitées ; réponses facultatives au questionnaire santé.",
    finalite: "Traiter votre demande de rendez-vous, vous la confirmer, adapter le soin.",
    base: "Mesures précontractuelles prises à votre demande (art. 6.1.b RGPD) ; consentement explicite pour les données de santé (art. 9.2.a).",
  },
  {
    formulaire: "Contact",
    donnees: "Nom, e-mail, téléphone (facultatif), sujet et contenu du message.",
    finalite: "Répondre à votre question.",
    base: "Intérêt légitime de l'institut à répondre aux demandes qui lui sont adressées (art. 6.1.f).",
  },
  {
    formulaire: "Bon cadeau",
    donnees: "Identité et e-mail de l'acheteur ; prénom du bénéficiaire, son e-mail en cas d'envoi programmé ; message, montant ou soin, date d'envoi, code du bon.",
    finalite: "Émettre le bon, l'envoyer à la date choisie, l'honorer lors du soin, tenir la comptabilité.",
    base: "Exécution du contrat (art. 6.1.b) ; obligation légale pour les pièces comptables (art. 6.1.c).",
  },
];

export default function ConfidentialitePage() {
  const { contact, legal } = site;

  const sections: LegalSection[] = [
    {
      id: "en-bref",
      titre: "En bref",
      contenu: (
        <ul>
          <li>Le site ne vend rien de vos données et ne dépose aucun cookie publicitaire.</li>
          <li>Les formulaires ne remplissent aucune base de données : ils envoient un e-mail à l&apos;institut, et un accusé de réception à vous.</li>
          <li>Les informations de santé sont facultatives, limitées à quatre cases, et ne sont pas conservées au-delà de l&apos;e-mail de demande.</li>
          <li>
            Vous pouvez à tout moment accéder à vos données, les faire corriger ou supprimer : écrivez à <a href={`mailto:${contact.email}`}>{contact.email}</a>.
          </li>
        </ul>
      ),
    },
    {
      id: "responsable",
      titre: "Responsable du traitement",
      contenu: (
        <p>
          <strong>{site.legalName}</strong> (« {site.name} »), représentée par <Champ>{legal.owner}</Champ>, {fullAddress}. Contact pour toute
          question relative à vos données : <a href={`mailto:${contact.email}`}>{contact.email}</a> ou {contact.phone}. L&apos;institut n&apos;est
          pas tenu de désigner un délégué à la protection des données.
        </p>
      ),
    },
    {
      id: "donnees",
      titre: "Données collectées par les formulaires",
      contenu: (
        <>
          <p>Seules les données nécessaires sont demandées. Les champs facultatifs sont signalés comme tels.</p>
          <div className="mt-6 space-y-4">
            {traitements.map((t) => (
              <div key={t.formulaire} className="rounded-[var(--radius-soft)] bg-voile p-5">
                <h3 className="!mt-0">{t.formulaire}</h3>
                <dl className="mt-3 grid gap-3 text-[0.95rem] sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-4">
                  <dt className="font-medium text-prune">Données</dt>
                  <dd>{t.donnees}</dd>
                  <dt className="font-medium text-prune">Finalité</dt>
                  <dd>{t.finalite}</dd>
                  <dt className="font-medium text-prune">Base légale</dt>
                  <dd>{t.base}</dd>
                </dl>
              </div>
            ))}
          </div>
          <p>
            Aucune décision automatisée ni profilage n&apos;est réalisé. Les données ne sont pas utilisées à des fins de prospection sans votre accord.
          </p>
        </>
      ),
    },
    {
      id: "sante",
      titre: "Données de santé : le strict minimum",
      contenu: (
        <>
          <p>
            Le questionnaire de réservation comporte quatre cases facultatives — grossesse en cours, allergies connues (avec un champ libre pour
            préciser l&apos;allergène), traitement dermatologique en cours, problème circulatoire. Elles servent uniquement à adapter le soin ou à
            vous rappeler s&apos;il doit être changé.
          </p>
          <ul>
            <li>En les cochant, vous consentez explicitement à ce traitement. Vous pouvez aussi ne rien cocher et en parler de vive voix.</li>
            <li>Elles ne figurent que dans l&apos;e-mail envoyé à l&apos;institut : elles ne sont ni enregistrées sur le site, ni recopiées dans l&apos;accusé de réception qui vous est adressé.</li>
            <li>
              L&apos;e-mail de demande est supprimé de la messagerie de l&apos;institut une fois le rendez-vous passé, au plus tard <Champ>[30 jours]</Champ> après.
            </li>
            <li>Elles ne sont communiquées à personne d&apos;autre que votre praticienne.</li>
          </ul>
        </>
      ),
    },
    {
      id: "conservation",
      titre: "Durées de conservation",
      contenu: (
        <ul>
          <li>
            <strong>Demande de réservation</strong> : jusqu&apos;au rendez-vous (données de santé : voir ci-dessus). Les coordonnées et l&apos;historique
            des soins peuvent ensuite être conservés <Champ>[3 ans]</Champ> à compter du dernier rendez-vous, pour le suivi de votre peau, sauf
            opposition de votre part.
          </li>
          <li>
            <strong>Message de contact</strong> : le temps de l&apos;échange, puis <Champ>[1 an]</Champ> au plus.
          </li>
          <li>
            <strong>Bon cadeau</strong> : pendant sa durée de validité ({site.policies.giftValidityMonths} mois), puis 10 ans pour les pièces
            comptables (article L. 123-22 du Code de commerce).
          </li>
          <li>
            <strong>Journaux techniques de l&apos;hébergeur</strong> : <Champ>[durée à confirmer selon l&apos;offre d&apos;hébergement]</Champ>.
          </li>
        </ul>
      ),
    },
    {
      id: "destinataires",
      titre: "Destinataires et sous-traitants",
      contenu: (
        <>
          <p>Vos données sont destinées à l&apos;institut et à ses deux praticiennes. Elles transitent par des prestataires techniques, liés par contrat :</p>
          <ul>
            <li>
              <strong>Hébergement du site</strong> : {legal.host}.
            </li>
            <li>
              <strong>Envoi des e-mails</strong> : Resend, Inc. (États-Unis), lorsque l&apos;envoi automatique est activé. Resend agit comme
              sous-traitant : il achemine les messages et n&apos;en fait aucun autre usage.
            </li>
            <li>
              <strong>Messagerie de l&apos;institut</strong> : <Champ>[fournisseur de la boîte e-mail à compléter]</Champ>.
            </li>
          </ul>
          <p>Aucune donnée n&apos;est vendue, louée ou cédée à des tiers.</p>
        </>
      ),
    },
    {
      id: "transferts",
      titre: "Transferts hors de l'Union européenne",
      contenu: (
        <p>
          Certains prestataires (hébergement, envoi d&apos;e-mails) sont établis aux États-Unis. Ces transferts s&apos;appuient sur la décision
          d&apos;adéquation « Data Privacy Framework » de la Commission européenne pour les entreprises certifiées, ou à défaut sur les clauses
          contractuelles types de la Commission. Une copie des garanties peut être obtenue sur demande.
        </p>
      ),
    },
    {
      id: "securite",
      titre: "Sécurité",
      contenu: (
        <p>
          Le site est servi exclusivement en HTTPS. Les formulaires sont validés côté serveur et n&apos;enregistrent rien sur le site lui-même.
          L&apos;accès à la messagerie de l&apos;institut est protégé par mot de passe <Champ>[et double authentification]</Champ>.
        </p>
      ),
    },
    {
      id: "droits",
      titre: "Vos droits",
      contenu: (
        <>
          <p>Conformément au RGPD et à la loi « Informatique et Libertés », vous disposez des droits suivants :</p>
          <ul>
            <li>droit d&apos;accès et de rectification ;</li>
            <li>droit à l&apos;effacement ;</li>
            <li>droit d&apos;opposition et droit à la limitation du traitement ;</li>
            <li>droit à la portabilité des données que vous avez fournies ;</li>
            <li>droit de retirer votre consentement à tout moment, notamment pour les données de santé ;</li>
            <li>droit de définir des directives relatives au sort de vos données après votre décès.</li>
          </ul>
          <p>
            Pour les exercer, écrivez à <a href={`mailto:${contact.email}`}>{contact.email}</a> ou par courrier au {fullAddress}. Nous répondons dans
            un délai d&apos;un mois. Une pièce d&apos;identité peut vous être demandée en cas de doute raisonnable sur votre identité.
          </p>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL, 3 place de Fontenoy, TSA
            80715, 75334 Paris Cedex 07 —{" "}
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
              cnil.fr/fr/plaintes
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      titre: "Cookies et stockage local",
      contenu: (
        <>
          <p>
            <strong>Aucun traceur n&apos;est déposé sans votre consentement.</strong> Le site n&apos;utilise ni cookie publicitaire, ni réseau
            social intégré, ni carte Google embarquée : la carte des infos pratiques est un dessin, et les itinéraires s&apos;ouvrent sur le site de
            Google uniquement si vous cliquez.
          </p>
          <ul>
            <li>
              <strong>Votre choix sur les cookies</strong> est mémorisé dans le stockage local de votre navigateur (clé « brume-consent »), avec sa
              date, jusqu&apos;à ce que vous le modifiiez ou effaciez les données du site.
            </li>
            <li>
              <strong>L&apos;animation d&apos;ouverture</strong> n&apos;est jouée qu&apos;une fois par visite : un marqueur technique est placé dans le
              stockage de session (clé « brume-seen ») et disparaît à la fermeture de l&apos;onglet.
            </li>
            <li>
              <strong>Mesure d&apos;audience</strong> : aucun outil n&apos;est installé à ce jour. S&apos;il l&apos;était, il ne serait activé
              qu&apos;après votre accord, et cette page préciserait lequel. <Champ>[outil et durée de conservation à compléter le cas échéant]</Champ>
            </li>
          </ul>
          <p className="flex flex-wrap items-center gap-3">
            Vous pouvez revoir votre choix à tout moment :
            <CookieSettingsButton className="inline-flex min-h-11 items-center rounded-full border border-prune/30 px-5 font-display text-[0.9rem] text-prune transition-colors duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune hover:bg-prune hover:text-lait" />
          </p>
        </>
      ),
    },
    {
      id: "mineurs",
      titre: "Mineurs",
      contenu: (
        <p>
          Certains soins, comme le modelage duo, sont accessibles dès 16 ans avec l&apos;autorisation d&apos;un parent. La demande de rendez-vous
          d&apos;un mineur doit alors être faite par son parent ou son représentant légal.
        </p>
      ),
    },
    {
      id: "modifications",
      titre: "Évolution de cette politique",
      contenu: (
        <p>
          Cette page peut évoluer, par exemple si un outil de mesure d&apos;audience est ajouté. La date de mise à jour figure dans le sommaire. Voir
          aussi les <Link href="/mentions-legales">mentions légales</Link>.
        </p>
      ),
    },
  ];

  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="Vos données"
        title="Confidentialité"
        crumbs={[{ name: "Confidentialité", path: "/confidentialite" }]}
        lead={
          <p>
            Ce que nos formulaires collectent, pourquoi, pour combien de temps, et comment reprendre la main. Écrit pour être lu, pas seulement pour
            exister.
          </p>
        }
      />
      <section aria-label="Politique de confidentialité" className="shell px-5 py-12 sm:px-10 lg:px-16 lg:py-20">
        <LegalLayout sections={sections} maj={MAJ} />
      </section>
    </div>
  );
}
