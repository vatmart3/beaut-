import { Suspense } from "react";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/ui/PageIntro";
import { ReservationFlow } from "@/features/reservation/ReservationFlow";
import { FlowFallback } from "@/features/reservation/FlowFallback";
import { ReserveAside } from "@/features/reservation/ReserveAside";

export const metadata = pageMetadata({
  title: "Réserver un soin à Balaruc-les-Bains · BRUME",
  description:
    "Réservez en ligne votre soin visage, modelage ou rituel duo à Balaruc-les-Bains : créneaux réels, confirmation sous 24 h ouvrées, sans paiement en ligne.",
  path: "/reserver",
});

export default function ReserverPage() {
  return (
    <div className="frame space-y-3 pt-3">
      <PageIntro
        eyebrow="Réservation en ligne"
        title="Réserver un soin"
        crumbs={[{ name: "Réserver", path: "/reserver" }]}
        lead={
          <p>
            Un soin, une praticienne, un créneau. Nous confirmons chaque demande {site.contact.responseTime}, par SMS ou e-mail. Aucun paiement en
            ligne : vous réglez sur place, après le soin.
          </p>
        }
        aside={<ReserveAside />}
      />
      <Suspense fallback={<FlowFallback />}>
        <ReservationFlow />
      </Suspense>
    </div>
  );
}
