import { Icon } from "@/components/Icon";

export interface BenefitsProps {
  items: any;
}

export function Benefits({ items }: BenefitsProps) {
  return (
    <ul className="benefits">
      {items.map((b) => <li key={b.title}><span className="bi"><Icon name={b.icon} /></span><span>{b.title}{b.text ? <small>{b.text}</small> : null}</span></li>)}
    </ul>
  );
}
