/** Squelette affiché pendant le chargement du tunnel (Suspense). */
export function FlowFallback() {
  return (
    <section aria-busy="true" aria-label="Réservation en ligne" className="shell px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pb-14 lg:pt-12">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <div className="grid max-w-xl grid-cols-4">
            {["Soin", "Praticienne", "Créneau", "Vous"].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <span className="size-11 animate-pulse rounded-full bg-voile" />
                <span className="text-[0.8125rem] text-prune-mute">{s}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 font-display text-[clamp(1.9rem,1.3rem+2.2vw,3.25rem)] font-light leading-none text-prune/40">Quel soin ?</p>
          <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-[var(--radius-soft)] bg-voile" style={{ animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
        </div>
        <div className="hidden lg:col-span-4 lg:block">
          <div className="h-96 rounded-[var(--radius-card)] bg-prune/90" />
        </div>
      </div>
    </section>
  );
}
