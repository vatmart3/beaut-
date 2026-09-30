/**
 * Fiche conseil « Routine peau après une journée de mer ».
 * Rédigée du point de vue d'une esthéticienne : conseils cosmétiques,
 * jamais médicaux. Les signaux d'alerte renvoient vers pharmacien / médecin.
 */

export const auteur = { prenom: "Clémence", nom: "Aubry", role: "esthéticienne, fondatrice de BRUME" };

export interface EtapeRoutine {
  heure: string;
  /** Pour le JSON-LD / l'impression. */
  duree: string;
  titre: string;
  texte: string;
  attention?: string;
}

export const etapes: EtapeRoutine[] = [
  {
    heure: "18 h 45",
    duree: "2 min",
    titre: "Un rinçage avant de quitter la plage",
    texte:
      "Passez sous la douche de plage, même trente secondes. Le sel qui sèche sur la peau continue de lui prendre de l'eau pendant tout le trajet. Tamponnez avec la serviette, sans frotter.",
  },
  {
    heure: "19 h 00",
    duree: "5 min",
    titre: "Une douche tiède, pas chaude",
    texte:
      "Entre 32 et 34 °C : une eau à peine plus fraîche que votre peau. Un gel lavant surgras sans parfum, seulement là où c'est utile. Rincez longtemps le cuir chevelu, la nuque, les plis des coudes et des genoux, où le sel se loge.",
  },
  {
    heure: "19 h 10",
    duree: "4 min",
    titre: "Un nettoyage doux du visage",
    texte:
      "Crème solaire résistante à l'eau, sel et sébum : un seul nettoyant ne suffit pas toujours. Massez une huile ou un baume démaquillant sur peau sèche, émulsionnez à l'eau tiède, puis un lait ou un gel doux. Séchez en tamponnant.",
    attention:
      "Pas de gommage ce soir : ni grains, ni brosse, ni acides (AHA, BHA), ni rétinol. Une peau exposée réagit plus fort. Attendez 48 à 72 heures.",
  },
  {
    heure: "19 h 15",
    duree: "3 min",
    titre: "L'hydratation en couches",
    texte:
      "Sur une peau encore un peu humide : une brume ou un hydrolat (bleuet, fleur d'oranger), puis un sérum à l'acide hyaluronique, puis une crème aux céramides qui referme le tout. Chaque couche retient la précédente. Si la peau chauffe, gardez la crème dix minutes au réfrigérateur.",
  },
  {
    heure: "19 h 20",
    duree: "5 min",
    titre: "L'après-soleil sur le corps",
    texte:
      "Un lait ou un gel après-soleil (aloe vera, panthénol), en couche généreuse. Insistez sur les épaules, le haut du dos, le nez, les pommettes et le dessus des pieds. Laissez pénétrer sans frotter, renouvelez au coucher si la peau tire.",
  },
  {
    heure: "19 h 25",
    duree: "1 min",
    titre: "Les lèvres",
    texte:
      "Elles n'ont pas de glandes sébacées et sèchent les premières. Un baume nourrissant sans parfum (karité, cire d'abeille ou de candelilla), en couche épaisse. Laissez de côté les gloss parfumés et les baumes mentholés qui picotent.",
  },
  {
    heure: "19 h 30",
    duree: "10 min",
    titre: "Les cheveux",
    texte:
      "Rincez à l'eau douce, un seul shampooing doux, puis un après-shampooing ou un masque sur les longueurs pendant cinq minutes. Démêlez au peigne à dents larges, séchez à l'air libre. Pas de lisseur ce soir.",
  },
  {
    heure: "22 h 30",
    duree: "2 min",
    titre: "Avant de dormir",
    texte:
      "Un grand verre d'eau, une dernière couche de crème si ça tire, une taie propre en coton. Et demain matin, une protection SPF 50, même sous un ciel gris.",
  },
];

export const aEviter = [
  {
    titre: "L'alcool",
    texte:
      "Dans les soins d'abord : toniques et lotions astringentes à l'alcool, après-rasages. Ils assèchent et piquent une peau exposée. Dans le verre ensuite : il déshydrate. Alternez avec de l'eau.",
  },
  {
    titre: "Le parfum sur la peau exposée",
    texte:
      "Certains composants, comme la bergamote et d'autres agrumes, sont photosensibilisants et peuvent laisser des taches brunes durables. Parfumez plutôt les vêtements, ou attendez le soir, sur une peau couverte. Même prudence avec les huiles essentielles d'agrumes.",
  },
  {
    titre: "Les corps gras épais sur une peau qui chauffe",
    texte: "Beurres riches et huiles épaisses retiennent la chaleur. Attendez que la peau ait refroidi, commencez par un gel ou un lait fluide.",
  },
  {
    titre: "L'eau très chaude, le hammam, le sauna",
    texte: "La chaleur dilate les vaisseaux et entretient les rougeurs. Tiède, toujours.",
  },
  {
    titre: "Arracher, percer, frotter",
    texte: "On ne perce pas une cloque et on ne tire pas sur la peau qui pèle : elle protège ce qui se reconstruit dessous.",
  },
];

export const alertes = [
  "Des cloques, même petites, ou une peau qui suinte.",
  "Une brûlure étendue (tout le dos, les jambes), une douleur qui empêche de dormir.",
  "De la fièvre, des frissons, des maux de tête, des nausées ou des vertiges : ce peut être une insolation.",
  "Un bébé, un enfant, une femme enceinte, une personne âgée, ou un traitement photosensibilisant en cours.",
];
