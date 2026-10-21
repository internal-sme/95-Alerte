export interface StepperProps {
  step: any;
  total: any;
  label: string;
}

export function Stepper({ step, total, label }: StepperProps) {
  return (
    <div className="stepper" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Étape ${step} sur ${total}`}>
      <div className="lbl"><span>Étape {step} sur {total}</span><span>{label}</span></div>
      <div className="track"><i style={{ width: `${(step / total) * 100}%` }} /></div>
    </div>
  );
}
