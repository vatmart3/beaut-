/** BRUME — le lieu, les produits, le protocole d'hygiène. */

export const espaces = [
  {
    id: "cabine-duo",
    titre: "La cabine duo",
    texte:
      "Deux tables chauffantes à 60 cm l'une de l'autre, une douche à l'italienne, des murs en enduit à la chaux couleur sable. La lumière vient d'une fenêtre haute, voilée de lin.",
    chiffre: "14 m²",
    matiere: "lin" as const,
  },
  {
    id: "cabine-soin",
    titre: "La cabine visage",
    texte:
      "Une loupe lumineuse, un vaporisateur à ozone désactivé (on préfère la vapeur douce), et un fauteuil qui se règle au centimètre. Rien d'autre.",
    chiffre: "1 fauteuil",
    matiere: "argile" as const,
  },
  {
    id: "tisanerie",
    titre: "La tisanerie",
    texte:
      "Six places sur des banquettes basses. Verveine, thym-citron, rooibos, eau infusée au concombre. Elle vous appartient après chaque soin, sans limite de temps.",
    chiffre: "20 min offertes",
    matiere: "eau" as const,
  },
];

export const produitsInstitut = {
  marque: "Maison Salvia",
  note: "Nom de marque placeholder — à remplacer par la marque réellement utilisée.",
  engagements: [
    "Fabriquée en France, formules sans parfum ajouté pour les peaux sensibles.",
    "Pas d'huiles minérales ni de silicones occlusifs dans les soins visage.",
    "Contenants rechargeables en cabine, recharges de 500 ml.",
  ],
  matieres: [
    { nom: "Sel marin fin", origine: "Méditerranée", usage: "gommages corps et pieds" },
    { nom: "Argile verte surfine", origine: "séchée au soleil", usage: "enveloppements, masques dos" },
    { nom: "Huiles végétales vierges", origine: "abricot, tournesol, sésame, pépins de raisin", usage: "modelages" },
    { nom: "Hydrolats", origine: "romarin, bleuet, fleur d'oranger", usage: "toniques, brumes" },
  ],
};

export const hygiene = [
  { titre: "Linge", texte: "Draps, serviettes et peignoirs changés à chaque cliente, lavés à 60 °C." },
  { titre: "Instruments", texte: "Pinces, repousse-cuticules et coupe-ongles nettoyés, puis stérilisés en autoclave classe B. Sachets datés, ouverts devant vous." },
  { titre: "Cire", texte: "Spatule à usage unique, jamais trempée deux fois. Cire à bande en rouleaux individuels." },
  { titre: "Cabines", texte: "Surfaces désinfectées entre chaque soin. 15 minutes minimum entre deux rendez-vous : c'est ce qui permet de ne jamais courir." },
  { titre: "Air", texte: "Aération complète entre deux clientes, pas de diffuseur de parfum d'ambiance." },
];
