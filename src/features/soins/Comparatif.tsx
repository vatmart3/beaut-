import Link from "next/link";
import { cures, detailsCure } from "@/data/rituels";
import { formatPrix, getSoin } from "@/data/soins";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

const cell = "px-4 py-4 align-top first:pl-0";

/**
 * Comparatif séance seule / cure 3 / cure 5 — un vrai <table>, avec
 * en-têtes de ligne et de colonne, légende, et première colonne collante
 * quand le tableau défile horizontalement sur petit écran.
 */
export function Comparatif() {
  const slugs = [...new Set(cures.map((c) => c.soin))];
  const lignes = slugs.map((slug) => {
    const soin = getSoin(slug)!;
    const trouve = (n: 3 | 5) => {
      const c = cures.find((x) => x.soin === slug && x.seances === n);
      return c ? { ...c, ...detailsCure(c) } : null;
    };
    return { soin, c3: trouve(3), c5: trouve(5) };
  });

  return (
    <>
    {/* Mobile : une carte par soin, rien à faire défiler */}
    <div className="space-y-3 sm:hidden">
      <p className="text-caption text-prune-mute">Prix TTC par personne, comparés au prix d&rsquo;une séance seule.</p>
      {lignes.map(({ soin, c3, c5 }) => (
        <article key={soin.slug} className="rounded-[var(--radius-card)] border hairline bg-ecume p-5">
          <h3 className="font-display text-[1.2rem] font-light leading-tight">
            <Link href={`/soins/${soin.slug}`} className="underline decoration-prune/20 underline-offset-4">
              {soin.nom}
            </Link>
          </h3>
          <dl className="mt-4 grid gap-2 text-[0.9rem]">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-prune-soft">Séance seule</dt>
              <dd className="tabular font-serif text-[1.2rem]">{formatPrix(soin.prix)}</dd>
            </div>
            {[
              { label: "Cure 3 séances", c: c3 },
              { label: "Cure 5 séances", c: c5 },
            ]
              .filter((x) => x.c)
              .map(({ label, c }) => (
                <div key={label} className={cn("flex items-baseline justify-between gap-3 rounded-[var(--radius-soft)] px-3 py-2.5 -mx-3", label.includes("5") && "bg-sauge-pale")}>
                  <dt>
                    <span className="block">{label}</span>
                    <span className="tabular text-caption text-prune-soft">
                      {formatPrix(c!.parSeance)} la séance · <span className="text-sauge-deep">−&nbsp;{formatPrix(c!.economie)}</span>
                    </span>
                  </dt>
                  <dd className="tabular font-serif text-[1.2rem]">{formatPrix(c!.prix)}</dd>
                </div>
              ))}
          </dl>
        </article>
      ))}
      <ul className="space-y-1.5 pt-2 text-[0.9rem] text-prune-soft">
        <li>— Cures valables 6 mois, nominatives, réglées sur place à la 1re séance.</li>
        <li>— Offertes en bon cadeau, elles restent valables {site.policies.giftValidityMonths} mois.</li>
      </ul>
    </div>
    <div className="relative hidden sm:block">
      <div className="overflow-x-auto pb-2" role="region" aria-labelledby="comparatif-legende" tabIndex={0}>
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <caption id="comparatif-legende" className="pb-6 text-left text-caption text-prune-mute">
            Prix TTC par personne. L&rsquo;économie est calculée par rapport au prix d&rsquo;une séance seule multiplié par le nombre de séances.
          </caption>
          <thead>
            <tr className="border-b border-prune/30">
              <th scope="col" className={cn(cell, "sticky left-0 z-10 w-[26%] bg-ecume pb-3 font-display text-caption font-medium text-prune-mute")}>
                Soin
              </th>
              <th scope="col" className={cn(cell, "pb-3")}>
                <span className="block font-display text-[1.05rem] font-normal">Séance seule</span>
                <span className="text-caption text-prune-mute">sans engagement</span>
              </th>
              <th scope="col" className={cn(cell, "pb-3")}>
                <span className="block font-display text-[1.05rem] font-normal">Cure 3 séances</span>
                <span className="text-caption text-prune-mute">un cycle de peau</span>
              </th>
              <th scope="col" className={cn(cell, "rounded-t-[var(--radius-soft)] bg-sauge-pale pb-3")}>
                <span className="block font-display text-[1.05rem] font-normal">Cure 5 séances</span>
                <span className="text-caption text-sauge-deep">la plus avantageuse</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lignes.map(({ soin, c3, c5 }) => (
              <tr key={soin.slug} className="border-b hairline">
                <th scope="row" className={cn(cell, "sticky left-0 z-10 bg-ecume font-display text-[1.05rem] font-light leading-snug")}>
                  <Link href={`/soins/${soin.slug}`} className="underline decoration-prune/20 underline-offset-4 transition-colors hover:decoration-prune">
                    {soin.nom}
                  </Link>
                </th>
                <td className={cell}>
                  <span className="tabular block font-serif text-[1.4rem] leading-none">{formatPrix(soin.prix)}</span>
                </td>
                {[c3, c5].map((c, k) => (
                  <td key={k} className={cn(cell, k === 1 && "bg-sauge-pale")}>
                    {c ? (
                      <>
                        <span className="tabular block font-serif text-[1.4rem] leading-none">{formatPrix(c.prix)}</span>
                        <span className="tabular mt-1.5 block text-caption text-prune-soft">{formatPrix(c.parSeance)} la séance</span>
                        <span className="tabular mt-0.5 block text-caption text-sauge-deep">−&nbsp;{formatPrix(c.economie)}</span>
                      </>
                    ) : (
                      <span className="text-caption text-prune-mute">
                        <span aria-hidden>—</span>
                        <span className="sr-only">Non proposée</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tbody className="text-[0.95rem]">
            {[
              ["Validité", "—", "6 mois", "6 mois"],
              ["Nominative", "—", "Oui", "Oui"],
              ["Règlement", "Sur place, après le soin", "Sur place, à la 1re séance", "Sur place, à la 1re séance"],
              ["En bon cadeau", `Oui, valable ${site.policies.giftValidityMonths} mois`, `Oui, valable ${site.policies.giftValidityMonths} mois`, `Oui, valable ${site.policies.giftValidityMonths} mois`],
            ].map(([label, ...vals], r, all) => (
              <tr key={label} className={cn(r < all.length - 1 && "border-b hairline")}>
                <th scope="row" className={cn(cell, "sticky left-0 z-10 bg-ecume font-display text-caption font-medium text-prune-mute")}>
                  {label}
                </th>
                {vals.map((v, k) => (
                  <td key={k} className={cn(cell, "text-prune-soft", k === 2 && "bg-sauge-pale", k === 2 && r === all.length - 1 && "rounded-b-[var(--radius-soft)]")}>
                    {v === "—" ? (
                      <>
                        <span aria-hidden>—</span>
                        <span className="sr-only">Non concerné</span>
                      </>
                    ) : (
                      v
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
