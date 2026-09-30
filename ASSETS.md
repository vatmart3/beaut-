# BRUME — visuels, sources et crédits

Le site privilégie des visuels **procéduraux** (SVG, shaders, 3D) : ils sont légers,
nets à toutes les tailles et propres au site. Une seule photographie est utilisée.

## 1. Photographie

| Fichier | Usage | Source | Statut |
|---|---|---|---|
| `public/images/hero-modele.png` (1197 × 1700, fond transparent) | Portrait du hero | Photo **Pexels** fournie par le client (licence Pexels : usage libre, commercial compris, sans attribution obligatoire). Détourée (BiRefNet portrait), bords d'épaules adoucis. | ✅ Libre de droits — créditer le photographe Pexels si possible |
| `public/images/brume/visage.jpg`, `regard.jpg`, `levres.jpg`, `pommette.jpg`, `epaules.jpg`, `profil.jpg`, `nude.jpg` | Mosaïque des soins, protocole signature, en-têtes des pages, bandeau défilant, cartes | Recadrages de la même photo Pexels | ✅ |
| `src/assets/og-portrait.png` | Images Open Graph | Réduction du portrait détouré | ✅ |

La licence Pexels interdit de vendre la photo telle quelle ou de laisser penser que la personne photographiée cautionne la marque : ici elle illustre un site de démonstration, ce qui est conforme. Pour un vrai client, prévoir une séance photo en institut.

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
