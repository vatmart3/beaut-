import Link from "next/link";
import { site, siteUrl, fullAddress } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { LegalLayout, type LegalSection } from "@/features/contenu/legal/LegalLayout";
import { Champ } from "@/features/contenu/legal/Champ";

export const metadata = pageMetadata({
  title: "Mentions légales · BRUME, institut à Balaruc-les-Bains",
  description: "Éditeur, hébergeur, propriété intellectuelle et crédits du site de BRUME, institut de soins au 4 rue des Sources, Balaruc-les-Bains.",
  path: "/mentions-legales",
});

const MAJ = "30 septembre 2026";

export default function MentionsLegalesPage() {
  const { legal, contact } = site;
  const domaine = siteUrl.replace(/^https?:\/\//, "");

  const sections: LegalSection[] = [
    {
      id: "editeur",
      titre: "Éditeur du site",
      contenu: (
        <>
          <p>
            Le site <strong>{domaine}</strong> est édité par :
          </p>
          <ul>
            <li>
              <strong>{site.legalName}</strong>, nom commercial « {site.name} »
            </li>
            <li>
              Exploitante : <Champ>{legal.owner}</Champ>
            </li>
            <li>
              Forme juridique : <Champ>{legal.status}</Champ>
            </li>
            <li>Siège : {fullAddress}, France</li>
            <li>
              SIRET : <Champ>{legal.siret}</Champ>
            </li>
            <li>
              Immatriculation : <Champ>{legal.rcs}</Champ>
            </li>
            <li>
              TVA : <Champ>{legal.vat}</Champ>
            </li>
            <li>
              Téléphone : <a href={contact.phoneHref}>{contact.phone}</a> — e-mail : <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "publication",
      titre: "Direction de la publication",
      contenu: (
        <p>
          Directrice de la publication : <Champ>{legal.publicationDirector}</Champ>, joignable à l&apos;adresse{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
      ),
    },
    {
      id: "hebergement",
      titre: "Hébergement",
      contenu: (
        <>
          <p>Le site est hébergé par :</p>
          <p>
            <strong>{legal.host}</strong>
          </p>
          <p>
            Les pages sont servies depuis le réseau de diffusion de l&apos;hébergeur, qui peut s&apos;appuyer sur des serveurs situés hors de
            l&apos;Union européenne. Voir la <Link href="/confidentialite#transferts">politique de confidentialité</Link> pour les garanties
            applicables.
          </p>
        </>
      ),
    },
    {
      id: "activite",
      titre: "Activité, assurance et médiation",
      contenu: (
        <>
          <p>
            Activité : institut de beauté — soins esthétiques à la personne (soins du visage et du corps, modelages de bien-être, épilations, beauté
            des mains et des pieds). Les modelages proposés sont des soins de bien-être à visée non thérapeutique ; ils ne remplacent en aucun cas un
            acte médical ou de kinésithérapie.
          </p>
          <p>
            Assurance responsabilité civile professionnelle : <Champ>{legal.insurance}</Champ>.
          </p>
          <p>
            Médiation de la consommation : conformément aux articles L. 611-1 et suivants du Code de la consommation, vous pouvez recourir
            gratuitement au médiateur suivant, après une réclamation écrite restée sans réponse satisfaisante auprès de l&apos;institut :{" "}
            <Champ>{legal.mediator}</Champ>.
          </p>
        </>
      ),
    },
    {
      id: "propriete",
      titre: "Propriété intellectuelle",
      contenu: (
        <>
          <p>
            L&apos;ensemble des éléments du site — textes, mise en page, illustrations, visuels procéduraux, carte du Bassin de Thau, pictogrammes,
            logotype et nom « {site.name} » — est protégé par le Code de la propriété intellectuelle. Toute reproduction ou représentation, totale
            ou partielle, sans autorisation écrite préalable, est interdite, à l&apos;exception de la fiche conseil « Routine peau après une journée
            de mer », que vous pouvez imprimer et partager librement pour un usage personnel et non commercial.
          </p>
          <p>
            Les marques de produits citées appartiennent à leurs titulaires respectifs. Leur mention n&apos;implique aucun partenariat.
          </p>
        </>
      ),
    },
    {
      id: "credits",
      titre: "Crédits",
      contenu: (
        <ul>
          <li>
            {site.agency.label} —{" "}
            <a href={site.agency.url} target="_blank" rel="noopener noreferrer">
              mjagency.eu
            </a>
          </li>
          <li>
            Photographie de la page d&apos;accueil : <Champ>[image provisoire, droits non établis — à remplacer avant mise en ligne]</Champ>
          </li>
          <li>Visuels « matières » (eau, argile, sel, lin, huile, galets), portraits-galets et carte : illustrations vectorielles originales.</li>
          <li>Icônes : dessinées pour le site.</li>
          <li>Polices : Manrope, Gloock et Hanken Grotesk, sous licence SIL Open Font License 1.1, auto-hébergées.</li>
          <li>
            Nom de marque de la gamme cosmétique : <Champ>[Maison Salvia — placeholder, à remplacer par la marque réellement utilisée]</Champ>
          </li>
        </ul>
      ),
    },
    {
      id: "responsabilite",
      titre: "Responsabilité et liens",
      contenu: (
        <>
          <p>
            Les informations publiées (soins, durées, tarifs, horaires, disponibilités) sont données à titre indicatif et peuvent évoluer. Les
            créneaux affichés en ligne ne valent pas confirmation : chaque rendez-vous est confirmé par l&apos;institut {contact.responseTime}.
          </p>
          <p>
            Les conseils publiés, notamment dans la fiche « Routine peau après une journée de mer », sont des conseils cosmétiques généraux. Ils ne
            constituent pas un avis médical : en cas de doute, consultez un pharmacien ou un médecin.
          </p>
          <p>
            Le site contient des liens vers des services tiers (itinéraires Google Maps, Instagram). L&apos;institut n&apos;exerce aucun contrôle sur
            leur contenu ni sur leurs pratiques en matière de données.
          </p>
        </>
      ),
    },
    {
      id: "donnees",
      titre: "Données personnelles et cookies",
      contenu: (
        <p>
          Le traitement des données transmises par les formulaires (réservation, contact, bon cadeau) et l&apos;usage du stockage local sont décrits
          dans la <Link href="/confidentialite">politique de confidentialité</Link>. Le site ne dépose aucun traceur publicitaire.
        </p>
      ),
    },
    {
      id: "droit",
      titre: "Droit applicable",
      contenu: (
        <p>
          Le présent site et ses mentions sont régis par le droit français. En cas de litige, et après tentative de résolution amiable, les
          tribunaux français sont compétents, dans les conditions prévues par le Code de la consommation lorsque vous agissez en tant que
          consommateur.
        </p>
      ),
    },
  ];

  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="Informations légales"
        title="Mentions légales"
        crumbs={[{ name: "Mentions légales", path: "/mentions-legales" }]}
        lead={
          <p>
            Qui édite ce site, qui l&apos;héberge, et ce que vous pouvez en faire. Les champs surlignés sont à compléter par l&apos;institut avant la
            mise en ligne.
          </p>
        }
      />
      <section aria-label="Contenu des mentions légales" className="shell px-5 py-12 sm:px-10 lg:px-16 lg:py-20">
        <LegalLayout sections={sections} maj={MAJ} />
      </section>
    </div>
  );
}
