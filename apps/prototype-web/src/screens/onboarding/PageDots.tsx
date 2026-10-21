import { cx } from "@/utils/index";

export interface PageDotsProps {
  count: any;
  index: any;
}

export function PageDots({ count, index }: PageDotsProps) {
  return (
    <span className="dots" role="img" aria-label={`Écran ${index + 1} sur ${count}`}>
      {Array.from({ length: count }, (_, i) => <i key={i} className={cx(i === index && "on")} />)}
    </span>
  );
}
