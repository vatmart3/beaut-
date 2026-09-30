/** BRUME — questions fréquentes (alimente /faq et le JSON-LD FAQPage). */
import { site } from "@/config/site";

export interface QR {
  q: string;
  r: string;
  theme: "reservation" | "soins" | "cadeaux" | "pratique";
}

export const faq: QR[] = [
  {
    theme: "reservation",
    q: "Comment réserver un soin à Balaruc-les-Bains ?",
    r: `En ligne sur la page Réserver, en trois étapes, ou par téléphone au ${site.contact.phone} aux heures d'ouverture. Nous confirmons chaque demande ${site.contact.responseTime}.`,
  },
  {
    theme: "reservation",
    q: "Puis-je annuler ou déplacer mon rendez-vous ?",
    r: `${site.policies.cancellation} Au-delà, le soin peut être dû. Un simple appel ou un e-mail suffit.`,
  },
  {
    theme: "reservation",
    q: "Faut-il verser un acompte ?",
    r: "Non. Aucun paiement en ligne n'est demandé : vous réglez sur place, après le soin.",
  },
  {
    theme: "soins",
    q: "Je n'ai jamais fait de soin en institut. Par quoi commencer ?",
    r: "Le soin découverte (45 minutes, 59 €) commence par 15 minutes de diagnostic. Vous repartez avec une fiche écrite de votre routine, sans obligation d'achat. Pour le corps, le modelage relaxant de 60 minutes est le plus simple pour une première fois.",
  },
  {
    theme: "soins",
    q: "Puis-je faire un soin pendant ma grossesse ?",
    r: "Oui, à partir du deuxième trimestre, pour les soins visage, la beauté des mains et des pieds, et un modelage adapté en position latérale. Nous évitons les enveloppements chauffants et le drainage. Signalez-le à la réservation : le questionnaire santé est fait pour ça.",
  },
  {
    theme: "soins",
    q: "Quels produits utilisez-vous ?",
    r: "Une gamme professionnelle française sans parfum ajouté pour le visage, des huiles végétales vierges, du sel marin de Méditerranée et de l'argile verte surfine pour le corps. La liste complète est affichée à l'institut et sur chaque fiche soin.",
  },
  {
    theme: "soins",
    q: "Je suis en cure aux thermes de Balaruc. Puis-je venir entre deux soins ?",
    r: "Oui, nous recevons beaucoup de curistes. Prévoyez au moins une heure entre la fin de vos soins thermaux et un modelage, et évitez l'enveloppement à l'argile le même jour qu'une application de boue thermale.",
  },
  {
    theme: "soins",
    q: "Les soins sont-ils réservés aux femmes ?",
    r: "Non. Tous nos soins visage, corps et mains-pieds sont ouverts à tous. Les épilations masculines se font sur demande, dos et torse uniquement.",
  },
  {
    theme: "cadeaux",
    q: "Combien de temps un bon cadeau est-il valable ?",
    r: `${site.policies.giftValidityMonths} mois à partir de la date d'achat. La date de validité est imprimée sur le bon, avec son code unique.`,
  },
  {
    theme: "cadeaux",
    q: "Le bon cadeau peut-il être utilisé pour un autre soin que celui indiqué ?",
    r: "Oui. Un bon « soin » peut être échangé contre un autre soin ; la différence de prix se règle sur place ou reste en avoir, également valable 12 mois.",
  },
  {
    theme: "pratique",
    q: "Où se garer ?",
    r: "Le stationnement est gratuit dans la rue et un parking public se trouve à 200 m. L'institut est de plain-pied et accessible aux personnes à mobilité réduite.",
  },
  {
    theme: "pratique",
    q: "Venez-vous de Sète, Frontignan ou Mèze ?",
    r: "Oui, une grande partie de nos clientes viennent de tout le Bassin de Thau : 12 minutes depuis Sète, 15 depuis Frontignan, 18 depuis Mèze.",
  },
  {
    theme: "pratique",
    q: "Combien de temps faut-il prévoir en plus du soin ?",
    r: "Arrivez 10 minutes avant pour vous installer. Après le soin, la tisanerie est à vous : comptez 15 à 20 minutes si vous voulez en profiter.",
  },
];
