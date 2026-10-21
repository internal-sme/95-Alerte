import { Icon } from "@/components/Icon";
import { cx } from "@/utils/index";
import type { ReactNode } from "react";

export interface BannerProps {
  tone?: string;
  icon?: string;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Banner({ tone = "info", icon, title, children, className }: BannerProps) {
  return (
    <div className={cx("banner", `banner-${tone}`, className)} role={tone === "emergency" ? "note" : "status"}>
      <Icon name={icon || (tone === "offline" ? "wifi-slash" : tone === "emergency" ? "siren-fill" : "info")} />
      <span>{title ? <b>{title}</b> : null}{children}</span>
    </div>
  );
}
