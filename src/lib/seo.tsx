import type { Metadata } from "next";
import { site, siteUrl, fullAddress, mapsSearchUrl } from "@/config/site";
import type { Soin } from "@/data/soins";
import { prixDepart, getCategorie } from "@/data/soins";
import type { QR } from "@/data/faq";

const dayMap = {
  lundi: "Monday",
  mardi: "Tuesday",
  mercredi: "Wednesday",
  jeudi: "Thursday",
  vendredi: "Friday",
  samedi: "Saturday",
  dimanche: "Sunday",
} as const;

export const businessId = `${siteUrl}/#institut`;

/**
 * Metadata d'une page : title ≤ 60 caractères, description ≤ 155,
 * canonical, Open Graph, Twitter. L'image OG est fournie par le fichier
 * `opengraph-image.tsx` de chaque segment.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  if (process.env.NODE_ENV !== "production") {
    if (title.length > 60) console.warn(`[seo] title > 60 (${title.length}) : ${title}`);
    if (description.length > 155) console.warn(`[seo] description > 155 (${description.length}) : ${path}`);
  }
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.fullName,
      url: path,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Le contenu provient uniquement de nos fichiers de données.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "DaySpa"],
    "@id": businessId,
    name: site.fullName,
    alternateName: site.name,
    description: site.description,
    url: siteUrl,
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    image: `${siteUrl}/opengraph-image`,
    logo: `${siteUrl}/icon.svg`,
    priceRange: site.priceRange,
    currenciesAccepted: "EUR",
    paymentAccepted: "Carte bancaire, espèces",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.address.geo.lat, longitude: site.address.geo.lng },
    hasMap: mapsSearchUrl,
    areaServed: site.areaServed.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: site.hours
      .filter((d) => d.ranges.length)
      .flatMap((d) =>
        d.ranges.map((r) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${dayMap[d.day]}`,
          opens: r.opens,
          closes: r.closes,
        })),
      ),
    sameAs: [site.social.instagram],
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Cabine duo", value: true },
      { "@type": "LocationFeatureSpecification", name: "Tisanerie", value: true },
      { "@type": "LocationFeatureSpecification", name: "Accès PMR", value: true },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path === "/" ? "" : it.path}`,
    })),
  };
}

export function faqJsonLd(list: QR[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.r } })),
  };
}

export function serviceJsonLd(s: Soin) {
  const offers = (s.variantes ?? [{ label: s.nom, duree: s.duree, prix: s.prix }]).map((v) => ({
    "@type": "Offer",
    name: v.label,
    price: v.prix.toFixed(2),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/soins/${s.slug}`,
    eligibleDuration: { "@type": "QuantitativeValue", value: v.duree, unitCode: "MIN" },
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/soins/${s.slug}#service`,
    name: s.nom,
    serviceType: getCategorie(s.categorie).label,
    description: `${s.accroche} ${s.description}`,
    provider: { "@id": businessId },
    areaServed: site.areaServed.map((name) => ({ "@type": "City", name })),
    url: `${siteUrl}/soins/${s.slug}`,
    offers: offers.length === 1 ? offers[0] : { "@type": "AggregateOffer", lowPrice: prixDepart(s).toFixed(2), highPrice: Math.max(...offers.map((o) => Number(o.price))).toFixed(2), priceCurrency: "EUR", offerCount: offers.length, offers },
  };
}

export function giftProductJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/bons-cadeaux#bon`,
    name: `Bon cadeau ${site.name} — institut de soins à ${site.address.city}`,
    description: `Bon cadeau valable ${site.policies.giftValidityMonths} mois, montant libre de ${site.policies.giftMin} à ${site.policies.giftMax} € ou soin au choix. À imprimer ou envoyer par e-mail à la date de votre choix.`,
    brand: { "@type": "Brand", name: site.name },
    image: `${siteUrl}/bons-cadeaux/opengraph-image`,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: site.policies.giftMin.toFixed(2),
      highPrice: site.policies.giftMax.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      seller: { "@id": businessId },
      url: `${siteUrl}/bons-cadeaux`,
    },
  };
}

export { fullAddress };
