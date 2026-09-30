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
    <div className="relative -mx-5 sm:mx-0">
      <div className="overflow-x-auto px-5 pb-2 sm:px-0" role="region" aria-labelledby="comparatif-legende" tabIndex={0}>
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
      <p className="mt-3 px-5 text-caption text-prune-mute sm:hidden" aria-hidden>
        Faites glisser le tableau vers la gauche pour voir les cures.
      </p>
    </div>
  );
}
