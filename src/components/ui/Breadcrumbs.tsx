import Link from "next/link";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

/** Fil d'Ariane visible + JSON-LD BreadcrumbList. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Fil d'Ariane" className="text-[0.8125rem] text-prune-mute">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="underline-offset-4 hover:text-prune hover:underline">
              Accueil
            </Link>
          </li>
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              <span aria-hidden className="inline-block size-1 rounded-full bg-prune/30" />
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-prune">
                  {it.name}
                </span>
              ) : (
                <Link href={it.path} className="underline-offset-4 hover:text-prune hover:underline">
                  {it.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
