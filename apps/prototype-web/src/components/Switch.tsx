export interface SwitchProps {
  label: string;
  checked: any;
  onChange: (...args: any[]) => any;
  id: string;
}

export function Switch({ label, checked, onChange, id }: SwitchProps) {
  return (
    <label className="switch" htmlFor={id}>
      {label}
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}
