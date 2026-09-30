# BRUME — Institut de soins · Balaruc-les-Bains

Site vitrine de démonstration — portfolio **MJAGENCY** (site 05/10).
Marque fictive traitée comme un vrai client : soins visage et corps, épilations,
beauté des mains et des pieds, rituels en cabine duo.

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict
- Tailwind CSS v4 (tokens du design system dans `src/app/globals.css`)
- Motion · GSAP + ScrollTrigger · Lenis
- React Three Fiber + drei (goutte de verre 3D, carte cadeau 3D)
- react-hook-form + zod · Resend (facultatif) · jsPDF

---

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production (doit passer sans erreur ni warning)
npm run start      # sert le build
npm run lint
```

Node.js 20.9 ou plus récent.

## Déployer sur Vercel

1. Poussez le dépôt sur GitHub, puis « Add New… › Project » sur vercel.com et
   importez-le. Aucun réglage de build n'est nécessaire (framework détecté).
2. Variables d'environnement (Settings › Environment Variables), voir `.env.example` :
   - `NEXT_PUBLIC_SITE_URL` — l'URL définitive (canonical, sitemap, Open Graph).
   - `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO` — pour recevoir réellement les
     demandes de réservation, bons cadeaux et contact. **Sans clé, le site
     fonctionne en mode démo** : les formulaires valident, affichent leur écran de
     succès, et le contenu est journalisé côté serveur (onglet « Logs » de Vercel).
3. Ajoutez le nom de domaine (Settings › Domains) puis mettez à jour
   `NEXT_PUBLIC_SITE_URL`.

## Modifier le contenu (un seul dossier pour le client)

| Quoi | Où |
|---|---|
| Nom, adresse, téléphone, e-mail, horaires, zone desservie, politique d'annulation, mentions légales | `src/config/site.ts` |
| Soins (prix, durées, déroulé minute par minute, contre-indications, conseils) | `src/data/soins.ts` |
| Cures 3 / 5 séances (l'économie est calculée automatiquement) | `src/data/rituels.ts` |
| Praticiennes | `src/data/praticiennes.ts` |
| Planning, pause déjeuner, fermetures exceptionnelles | `src/data/planning.ts` |
| Quiz « Votre rituel » (questions et calcul) | `src/data/quiz.ts` |
| Bons cadeaux (motifs, montants, occasions saisonnières) | `src/data/bons-cadeaux.ts` |
| Avis clients (**démo : à remplacer par les vrais avis**) et chiffres | `src/data/avis.ts` |
| FAQ | `src/data/faq.ts` |
| Le lieu, produits, protocole d'hygiène | `src/data/institut.ts` |

Le NAP (nom, adresse, téléphone) est lu partout depuis `site.ts` : footer, menu,
pages, JSON-LD — il reste identique sur tout le site.

### Images

- Le portrait du hero est `public/images/hero-modele.png` (PNG détouré, photo Pexels).
  Si vous le remplacez et que le cadrage change, ajustez dans
  `src/sections/home/Hero.tsx` le point sur la joue (`left-[64.3%] top-[50.6%]`),
  le tracé du trait (`d="M770 860 …"`) et, dans `hero.module.css`, le ratio `1197 / 1700`.
- Les recadrages utilisés partout sont dans `public/images/brume/`.
- Les autres visuels sont procéduraux (`src/components/ui/Matiere.tsx`) : pour mettre
  de vraies photos, remplacez `<Matiere …/>` par `next/image` avec les mêmes ratios.

### Planning réel

`src/data/planning.ts` simule l'occupation de façon déterministe. Pour un vrai
client, remplacez `estPris()` par un appel à l'outil de réservation utilisé
(Planity, Kalendes, Google Agenda, base de données…).

## Architecture

```
src/
  app/                 routes (App Router), metadata, opengraph-image par page, API
  config/site.ts       coordonnées & réglages client
  data/                contenus métier
  components/
    layout/            header en pastilles, menu « galets », footer, loader, cookies, CTA mobile, transitions
    ui/                boutons magnétiques, pastilles, champs de formulaire, visuels « matières »
    effects/           révélations (masques, clip-path, ondulation), onde shader, compteurs
    three/             goutte de verre (R3F)
    icons/             icônes dessinées sur mesure
  sections/home/       sections de l'accueil
  features/            modules métier (soins, bons cadeaux, réservation, contenus)
  lib/                 SEO/JSON-LD, OG, e-mail, horaires, easings, détection 3D
```

## Performance & accessibilité

- La 3D est chargée en différé (`next/dynamic`, `ssr: false`) et remplacée par une
  goutte SVG si WebGL est absent, si `prefers-reduced-motion` est actif ou si
  l'appareil est modeste (`hardwareConcurrency` ≤ 4 ou `deviceMemory` ≤ 4).
  `dpr` plafonné à 1,5 ; rendu suspendu quand le hero sort de l'écran.
- La séquence d'entrée du hero et le loader sont en CSS pur : ils ne dépendent pas
  de l'hydratation (LCP rapide). Le loader n'apparaît qu'une fois par session.
- `prefers-reduced-motion` : Lenis désactivé, animations remplacées par des fondus.
- Contrastes AA vérifiés sur les tokens, focus visible, navigation clavier complète,
  cibles tactiles ≥ 44 px.

## Crédits

Site concept — design & développement **MJAGENCY** · https://mjagency.eu
