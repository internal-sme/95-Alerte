import { cx } from "@/utils/index";

export interface ReasonOptionProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  help: string;
}

export function ReasonOption({ name, value, checked, onChange, label, help }: ReasonOptionProps) {
  return (
    <label className={cx("reason-option", checked && "is-checked")}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span><b>{label}</b><small>{help}</small></span>
      <span className="rc-dot" />
    </label>
  );
}
