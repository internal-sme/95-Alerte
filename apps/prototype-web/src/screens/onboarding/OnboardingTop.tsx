import { Button } from "@/components/Button";
import { Logo95 } from "@/components/Logo95";
import { cx } from "@/utils/index";
import type { Ref } from "react";

export interface OnboardingTopProps {
  onSkip: (...args: any[]) => any;
  skipLabel?: string;
  logoRef?: Ref<any>;
  onMedia?: boolean | ((...args: any[]) => any);
}

export function OnboardingTop({ onSkip, skipLabel = "Passer", logoRef, onMedia }: OnboardingTopProps) {
  return (
    <div className="onb-top">
      {onMedia ? null : <span ref={logoRef} className="onb-logo"><Logo95 width={44} label="95 Alerte" /></span>}
      {onSkip ? <Button variant={onMedia ? "tertiary" : "ghost"} className={cx(onMedia ? "onb-skip on-media" : "btn-inline onb-skip")} onClick={onSkip}>{skipLabel}</Button> : null}
    </div>
  );
}
