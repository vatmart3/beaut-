# BRUME — visuels, sources et crédits

Le site privilégie des visuels **procéduraux** (SVG, shaders, 3D) : ils sont légers,
nets à toutes les tailles et propres au site. Une seule photographie est utilisée.

## 1. Photographie

| Fichier | Usage | Source | Statut |
|---|---|---|---|
| `public/images/hero-portrait.png` (1340 × 1404, fond transparent) | Portrait du hero (accueil) | Image de référence fournie par le client (maquette « SKINOPHY »). Détourée (BiRefNet portrait), trait de légende retiré par inpainting, agrandie ×2 (Lanczos + accentuation légère). La zone de l'ancienne carte produit est floutée : la carte soin du site la recouvre exactement. | ⚠️ **Placeholder — droits inconnus.** À remplacer avant toute mise en ligne publique par une photo sous licence (banque d'images payante ou séance photo). |
| `public/images/soin-visage.jpg`, `public/images/soin-visage-detail.jpg` | Visuel « portrait » des fiches soins visage | Recadrages de la même image | ⚠️ Même statut : à remplacer. |
| `src/assets/og-portrait.png` | Images Open Graph (`next/og`) | Réduction de la même image | ⚠️ Même statut : à remplacer. |

### Prompt pour régénérer un portrait équivalent (IA ou brief photographe)

> Studio beauty portrait of a woman in her late twenties with long, glossy dark-brown
> wavy hair falling over both shoulders, soft natural smile, eyes looking at the camera,
> head very slightly tilted. Her right hand's fingertips rest lightly on her cheekbone,
> where a small dollop of white face cream sits just under the eye. White thin-strap
> top. Pure white seamless background, soft diffused daylight from the front-left,
> no harsh shadows, dewy luminous skin with natural texture, subtle warm peach makeup.
> Framing: from the top of the head (with a little air above) down to mid-chest,
> subject centered. Photorealistic, 85 mm lens, f/5.6, high-end skincare campaign.
>
> **Format de livraison : 2400 × 2520 px minimum (ratio 670:702), PNG détouré
> (fond transparent) ou JPG sur fond blanc pur.** Le visage doit occuper la même place :
> yeux à ~33 % de la hauteur, pommette touchée à ~55 % de la largeur (le trait fin du
> hero part de ce point — coordonnées réglables dans `src/sections/home/Hero.tsx`).

### Photos à prévoir pour un vrai client (brief photographe)

Lumière naturelle, grain très fin, ombres douces « sous un voile d'eau », palette
lait / argile / sauge / sable / prune. Toujours sans visage identifiable sans accord écrit.

| Sujet | Où | Format |
|---|---|---|
| Cabine duo, lumière du matin, deux tables, draps de lin | Accueil « L'espace », /institut | 1600 × 2000 (4:5) |
| Tisanerie : théière en grès, tasses, verveine fraîche | Accueil « L'espace », /institut | 1600 × 1280 (5:4) |
| Mains de praticienne, huile tiède versée dans la paume | Fiches corps, /soins | 1600 × 2000 |
| Sel marin fin en gros plan dans un bol de grès | Gommage, Rituel Thau | 1600 × 2000 |
| Argile verte en texture, pinceau large | Enveloppement | 1600 × 2000 |
| Portraits de Clémence et Inès, en blouse lin, fond enduit sable | Praticiennes | 1600 × 2000 |

Les emplacements actuels utilisent le composant `Matiere` (visuels SVG) et des galets
monogrammes : remplacer par `next/image` en gardant les mêmes ratios.

## 2. Visuels procéduraux (créés pour le site, libres de droits)

- `src/components/ui/Matiere.tsx` — textures SVG « eau », « argile », « sel », « lin »,
  « huile », « galets » (filtres feTurbulence / éclairage diffus).
- `src/components/three/HeroDrop.tsx` — goutte de verre liquide 3D, géométrie
  procédurale, `MeshTransmissionMaterial` (drei), éclairage par Lightformers (aucun HDR
  téléchargé).
- `src/components/effects/RippleCanvas.tsx` — onde concentrique, shader GLSL maison.
- `src/components/icons/Icon.tsx` — jeu d'icônes dessiné sur mesure.
- `public/textures/grain.svg` — grain photographique très fin.
- `src/app/icon.svg`, `src/app/apple-icon.tsx` — favicon goutte.
- Carte cadeau, pot de crème, galets du menu : SVG/CSS dessinés dans les composants.

## 3. Typographies (Google Fonts, licence SIL Open Font License)

- **Manrope** — titres et mot-marque (demande client : la typo de la référence).
- **Gloock** — accents (prix, chiffres).
- **Hanken Grotesk** — texte courant.

Chargées via `next/font` (auto-hébergées). Copies TTF pour les images OG dans
`src/assets/fonts/`.
