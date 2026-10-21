export interface StepProgressProps {
  step: any;
  total: any;
}

export function StepProgress({ step, total }: StepProgressProps) {
  return (
    <div className="step-progress">
      <span className="track" aria-hidden="true"><i style={{ width: `${(step / total) * 100}%` }} /></span>
      <small>Étape {step} sur {total}</small>
    </div>
  );
}
