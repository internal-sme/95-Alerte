import { Fragment } from "react";
import { AlertCard } from "@/components/AlertCard";
import { SEED_ALERTS } from "@/data/seed";

export function DemoSheetContent() {
  return (
    <Fragment>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>Faites glisser la poignée, ou utilisez les flèches ↑ ↓ du clavier quand elle a le focus. Échap ferme le panneau.</p>
      {SEED_ALERTS.slice(3, 6).map((a) => <AlertCard key={a.id} alert={a} />)}
    </Fragment>
  );
}
