import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";

export interface SegmentedControlProps {
  options: any;
  value: any;
  onChange: (...args: any[]) => any;
  label: string;
  block?: boolean;
}

export function SegmentedControl({ options, value, onChange, label, block }: SegmentedControlProps) {
  return (
    <div className={cx("seg", block && "is-block")} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.icon ? <Icon name={o.icon} className="ph-sm" /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}
