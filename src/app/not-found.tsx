import Link from "next/link";

export default function NotFound() {
  return (
    <div className="frame pt-3">
      <section className="shell grid min-h-[80vh] place-items-center px-6 py-32 text-center">
        <div>
          <p className="eyebrow text-prune-mute">Erreur 404</p>
          <h1 className="mt-4 font-display text-display font-light">Cette page s&apos;est évaporée.</h1>
          <p className="mx-auto mt-6 max-w-md text-prune-soft">L&apos;adresse a peut-être changé. Les soins, eux, sont toujours là.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-prune px-6 font-display text-lait">Retour à l&apos;accueil</Link>
            <Link href="/soins" className="inline-flex min-h-12 items-center rounded-full border border-prune/40 px-6 font-display">Voir les soins</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
