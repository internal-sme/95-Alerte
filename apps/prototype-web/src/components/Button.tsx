import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { cx } from "@/utils/index";
import type { ReactNode } from "react";

export interface ButtonProps {
  variant?: any;
  block?: boolean;
  loading?: any;
  icon?: string;
  children: ReactNode;
  className?: string;
  [prop: string]: any;
}

export function Button({ variant = "primary", block, loading, icon, children, className, ...rest }: ButtonProps) {
  return (
    <button type="button" className={cx("btn", `btn-${variant}`, block && "btn-block", className)} aria-busy={loading || undefined} disabled={rest.disabled || loading} {...rest}>
      {loading ? <Spinner /> : icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}
