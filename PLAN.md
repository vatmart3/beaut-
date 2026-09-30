# BRUME — Institut de soins · Plan de construction

Site vitrine de démonstration · Portfolio MJAGENCY · Site 05/10
Stack : Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind v4 · Motion · GSAP + ScrollTrigger · Lenis · React Three Fiber + drei · react-hook-form + zod · Resend (optionnel).

---

## 0. Demande client prioritaire (révision du brief)

Le client a fourni une image de référence : un hero « éditorial » où **un portrait
détouré se tient devant un mot-marque géant**, dans un grand conteneur blanc aux
angles très arrondis, avec des **pastilles (pills) fines en haut**, une accroche en
haut à gauche et **une carte produit arrondie** posée sur l'épaule, reliée au visage
par un trait fin. Il veut que le hero de BRUME soit « presque la photo », avec une
typographie **ronde, simple, qui sent le luxe et la beauté**.

Décisions :

- Le portrait de la référence est réutilisé (détouré, trait de légende retiré), en
  **placeholder** : ses droits ne sont pas connus → à remplacer avant mise en ligne
  (voir `ASSETS.md`, prompt de génération fourni).
- Le mot-marque **BRUME** passe derrière le portrait (le « U » est masqué par le
  visage, comme dans la référence).
- Typo d'affichage : **Manrope** (la grotesque ronde de la référence) en graisses
  légères, interlettrage serré. Le brief demandait Gloock : elle est conservée comme
  **serif d'accent** (chiffres, citations, prix) — c'est elle qui apporte le « luxe ».
  Texte courant : **Hanken Grotesk** légère, comme demandé.
- Le moment 3D (goutte de verre liquide) est conservé et intégré à cette
  composition : la goutte flotte devant les lettres « ME », les réfracte, et tombe
  au scroll.

## 1. Arborescence

```
/                         Accueil
/soins                    Carte complète filtrable (catégorie, durée, prix)
/soins/[slug]             Fiche soin (déroulé minute par minute, contre-indications, avant/après)
/rituels                  Cures 3 / 5 séances + rituels duo (ancrage prix)
/bons-cadeaux             Configurateur (montant libre ou soin, 3 motifs, aperçu 3D recto/verso, PDF, envoi daté)
/institut                 Le lieu, la tisanerie, les produits, l'hygiène, les praticiennes
/reserver                 Réservation en 4 temps (soin → praticienne → créneau → santé & coordonnées)
/infos-pratiques          Adresse, accès, parking, horaires, annulation
/faq                      FAQ (FAQPage)
/conseils/routine-peau-apres-la-mer   Fiche conseil offerte (réciprocité)
/mentions-legales · /confidentialite · /cgv-bons-cadeaux
/api/reservation · /api/bon-cadeau · /api/contact     (Resend si clé, sinon mode démo)
```

## 2. Accueil — découpage & animation par section

| # | Section | Idée | Animation d'entrée |
|---|---------|------|--------------------|
| 0 | Loader | Une goutte tombe, touche une ligne d'eau, l'onde s'ouvre et laisse apparaître « BRUME » | SVG + Motion, < 1,3 s, une fois par session |
| 1 | Hero « portrait » | Conteneur arrondi, pills, accroche, BRUME géant derrière le portrait, carte soin arrondie reliée à la joue par un trait fin, goutte 3D | Lettres qui montent sous masque, portrait qui se dévoile par le bas (clip-path), trait qui se dessine, carte qui se pose ; la goutte suit la souris / l'inclinaison |
| 2 | Chute & promesse | Au scroll la goutte tombe ; l'impact déclenche une **onde (shader)** sur toute la largeur qui révèle la promesse et les 5 familles de soins | Ripple WebGL + révélation circulaire (clip-path) depuis le point d'impact |
| 3 | Votre rituel en 4 questions | Quiz visuel, progression en gouttes | Section épinglée courte : la question « se compose » mot à mot |
| 4 | La carte | Aperçu des soins par famille, liste éditoriale asymétrique | Changement de famille = petite reprise d'onde ; lignes qui montent avec inertie |
| 5 | L'espace | Cabine duo, tisanerie, lumière | Parallaxe de profondeur sur 3 plans + visuels qui « respirent » (1 → 1,02) |
| 6 | Bons cadeaux | Mis en avant automatiquement avant St-Valentin / fête des mères / Noël | Carte qui pivote en 3D légère au scroll |
| 7 | Les praticiennes | Deux portraits illustrés, spécialités, années | Révélation par ondulation (masque SVG turbulence) |
| 8 | Avis | « Carnet » : index de prénoms + soin à gauche, citation en grand à droite, sans étoiles | Texte qui se recompose (crossfade flou) à chaque sélection |
| 9 | Réserver | Formulaire court « 3 clics » + appel direct + itinéraire | Compteurs (créneaux libres cette semaine calculés depuis `planning.ts`) |

## 3. Moment 3D signature

- `HeroDrop` (R3F, lazy `dynamic` + `Suspense`) : un plan plein cadre porte une texture
  2D peinte à partir des positions réelles des lettres DOM (alignement pixel) ; la
  goutte (géométrie procédurale, sphère étirée + bruit) utilise
  `MeshTransmissionMaterial` (réfraction, aberration chromatique 0,03, IOR 1,33).
- Suivi souris amorti (lerp), `DeviceOrientation` sur mobile avec bouton
  d'autorisation iOS.
- Scroll : progression GSAP → la goutte descend, s'étire, sort du hero ; l'impact
  déclenche `RippleReveal` (shader GLSL maison, WebGL brut) sur la section suivante.
- Performance : `dpr` ≤ 1,5, `frameloop="demand"` hors écran (IntersectionObserver),
  géométrie/matériau uniques.
- Fallback : goutte SVG (dégradés radiaux) si pas de WebGL, `prefers-reduced-motion`,
  `hardwareConcurrency` ≤ 4 ou `deviceMemory` ≤ 4.

## 4. Fonctionnalités métier

- **Quiz** (4 questions visuelles) → 1 soin recommandé + 1 alternative (scoring
  déterministe dans `src/data/quiz.ts`), bouton « Réserver ce soin » pré-rempli.
- **Carte des soins** : filtres catégorie / durée / prix (état dans l'URL), fiche
  détaillée statique par soin.
- **Bon cadeau** : montant libre (30–500 €) ou soin précis, message, destinataire,
  3 motifs (Galets, Brume, Argile), carte 3D recto/verso, envoi à date choisie ou PDF
  (jsPDF côté client) avec code unique et date de validité (12 mois).
- **Réservation** : soin → praticienne → date → créneau (depuis `planning.ts`),
  questionnaire santé (cases à cocher, non stocké au-delà de l'e-mail de demande),
  confirmation soignée.

## 5. Leviers de conversion

- Friction : réserver en 3 clics depuis n'importe quelle fiche (`?soin=`), CTA collant
  mobile (Réserver / Offrir / Appeler), `tel:` et itinéraire en un geste.
- Zeigarnik : quiz avec progression en gouttes.
- Preuve sociale : carnet d'avis (données de démo commentées), chiffres concrets.
- Ancrage : cures 5 séances avec économie affichée vs prix unitaire.
- Réciprocité : fiche « Routine peau après une journée de mer » offerte, sans e-mail.
- Autorité : protocole d'hygiène détaillé, formation des praticiennes, réponse sous 24 h ouvrées.
- Rareté réelle : créneaux restants calculés depuis le planning ; mise en avant des
  bons cadeaux calculée sur la date réelle.

## 6. SEO local

Mots-clés : institut de beauté Balaruc-les-Bains, spa Balaruc, soin visage Sète,
modelage Balaruc-les-Bains, bon cadeau spa Sète, institut beauté Frontignan,
soin duo Bassin de Thau.
JSON-LD : `BeautySalon` + `DaySpa` (même `@id`), `openingHoursSpecification`,
`areaServed` (Balaruc-les-Bains, Balaruc-le-Vieux, Sète, Frontignan, Mèze, Bouzigues,
Poussan), `geo`, `priceRange`, `BreadcrumbList`, `FAQPage`, `Service` + `Offer` par soin,
`Product` pour le bon cadeau. OG image dynamique par page (`next/og`).

## 7. Design system (source unique : `src/app/globals.css` → `@theme`)

- **Couleurs** : lait `#FAF6F1`, argile `#C9A48A`, sauge `#9CAF9A`, sable `#E8DDD0`,
  prune `#3B2A33`. Dérivés accessibles : `prune-soft #65535D` (texte secondaire),
  `argile-deep #8B5E45`, `sauge-deep #52684F` (textes d'accent ≥ 4,5:1), `voile #F1EBE3`
  (fond de page autour des conteneurs), `ecume #FFFDFA` (intérieur des conteneurs).
- **Typo** : Manrope (display 300–500), Gloock (accent), Hanken Grotesk (texte 300–500).
  Échelle fluide `clamp()` de `--text-micro` à `--text-wordmark` (≈ 23vw).
- **Rayons** : `pill` 999px · `soft` 18px · `card` 28px · `shell` 40px · galets en
  `border-radius` organiques.
- **Ombres** : « sous un voile d'eau » — larges, très diffuses, teintées prune à 6–10 %.
- **Easings** : `veil (0.22,1,0.36,1)` · `tide (0.7,0,0.2,1)` · `fall (0.55,0,1,0.45)` ·
  `float (0.33,1,0.68,1)`. Durées UI 200 / 350 / 500 / 700 ms.
- **Grille** : 12 colonnes, gouttière fluide, conteneurs « coquille » arrondis
  séparés par des silences de 12–20vh.

## 8. Règles anti-template appliquées

Pas de hero centré à deux boutons, pas de grille de 3 cartes à pictos, pas de
carrousel d'avis ni d'étoiles, pas d'emojis ni d'icônes génériques (toutes les
icônes sont dessinées dans `src/components/icons`), pas de dégradés violet/bleu ni
de blobs flous en fond. Vocabulaire métier : gommage, enveloppement, effleurage,
pétrissage, lissages, pressions glissées, drainage, masque occlusif, sérum,
barrière cutanée, cabine duo, tisanerie.

## 9. Étapes & commits

1. setup → 2. design system + primitives → 3. layout (header, menu galets, footer,
loader, cookies, CTA mobile, transitions) → 4. hero + 3D → 5. sections accueil →
6. soins & rituels → 7. bons cadeaux → 8. réservation → 9. pages infos / FAQ / légales
→ 10. SEO (JSON-LD, OG, sitemap) → 11. contrôle visuel 375/768/1440/1920 & polish →
12. README / ASSETS.
