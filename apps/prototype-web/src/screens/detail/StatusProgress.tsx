import { cx } from "@/utils/index";

/* Progression du traitement en une ligne : 6 segments, l'étape atteinte, sa position */
export interface StatusProgressProps {
  index: any;
  total: any;
}

export function StatusProgress({ index, total }: StatusProgressProps) {
  return (
    <div className="status-progress" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => <i key={i} className={cx(i <= index && "on", i === index && "now")} />)}
    </div>
  );
}
