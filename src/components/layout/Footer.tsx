import Link from "next/link";
import { site, nav, mapsUrl } from "@/config/site";
import { hoursGrouped } from "@/lib/hours";
import { CookieSettingsButton } from "./CookieBanner";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="frame pb-28 pt-4 md:pb-4">
      <div className="shell grain overflow-hidden bg-prune px-6 pb-8 pt-16 text-lait sm:px-10 lg:px-16 lg:pt-24">
        <div className="relative z-[2] grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="font-serif text-[clamp(2rem,1.2rem+3vw,3.75rem)] leading-[1.05] tracking-[-0.01em]">
              4 rue des Sources.
              <br />
              <span className="text-argile">À quatre minutes à pied des thermes.</span>
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/reserver" className="inline-flex min-h-12 items-center rounded-full bg-lait px-6 font-display text-prune transition-colors hover:bg-white">
                Réserver un soin
              </Link>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-lait/40 px-6 font-display transition-colors hover:border-lait hover:bg-lait hover:text-prune">
                Itinéraire
              </a>
              <a href={site.contact.phoneHref} className="inline-flex min-h-12 items-center rounded-full border border-lait/40 px-6 font-display transition-colors hover:border-lait hover:bg-lait hover:text-prune">
                {site.contact.phone}
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-6">
            <div>
              <h2 className="eyebrow text-lait/60">Institut</h2>
              <address className="mt-4 not-italic leading-relaxed text-lait/90">
                {site.fullName}
                <br />
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
                <br />
                <a href={`mailto:${site.contact.email}`} className="underline decoration-lait/30 underline-offset-4 hover:decoration-lait">
                  {site.contact.email}
                </a>
              </address>
            </div>
            <div>
              <h2 className="eyebrow text-lait/60">Horaires</h2>
              <dl className="mt-4 space-y-1.5 text-lait/90">
                {hoursGrouped().map((g) => (
                  <div key={g.jours} className="flex justify-between gap-4">
                    <dt>{g.jours}</dt>
                    <dd className="tabular text-right">{g.plages}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="eyebrow text-lait/60">Rubriques</h2>
              <ul className="mt-4 space-y-1.5">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="text-lait/90 underline-offset-4 hover:underline">
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/conseils/routine-peau-apres-la-mer" className="text-lait/90 underline-offset-4 hover:underline">
                    Fiche conseil offerte
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p aria-hidden className="relative z-[2] mt-16 select-none font-display text-[clamp(4rem,19vw,22rem)] font-light leading-[0.78] tracking-[-0.06em] text-lait/[0.07]">
          BRUME
        </p>

        <div className="relative z-[2] mt-6 flex flex-col gap-4 border-t border-lait/15 pt-6 text-[0.8125rem] text-lait/70 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {year} {site.name} · Institut de beauté à {site.address.city}, Bassin de Thau
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/mentions-legales" className="hover:text-lait">Mentions légales</Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-lait">Confidentialité</Link>
            </li>
            <li>
              <Link href="/cgv-bons-cadeaux" className="hover:text-lait">CGV bons cadeaux</Link>
            </li>
            <li>
              <CookieSettingsButton className="hover:text-lait" />
            </li>
          </ul>
          <a href={site.agency.url} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-lait/70 hover:text-lait">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-argile transition-transform duration-500 group-hover:scale-[2.2]" />
            {site.agency.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
