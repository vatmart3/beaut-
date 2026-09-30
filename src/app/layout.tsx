import type { Metadata, Viewport } from "next";
import { Gloock, Hanken_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { site, siteUrl } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { StickyCta } from "@/components/layout/StickyCta";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Loader, loaderScript } from "@/components/layout/Loader";
import { JsonLd, businessJsonLd } from "@/lib/seo";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", weight: ["300", "400", "500"] });
const gloock = Gloock({ subsets: ["latin"], variable: "--font-gloock", display: "swap", weight: "400" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap", weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} — Institut de beauté à Balaruc-les-Bains`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.fullName,
  formatDetection: { telephone: false },
  category: "beauty",
};

export const viewport: Viewport = {
  themeColor: "#F1EBE3",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${manrope.variable} ${gloock.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
      </head>
      <body>
        <Loader />
        <JsonLd data={businessJsonLd()} />
        <SmoothScroll>
          <Header />
          <main id="contenu">{children}</main>
          <Footer />
          <StickyCta />
          <CookieBanner />
        </SmoothScroll>
      </body>
    </html>
  );
}
