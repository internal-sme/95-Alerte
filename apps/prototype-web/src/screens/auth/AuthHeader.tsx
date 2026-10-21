import { Fragment } from "react";
import { IconButton } from "@/components/IconButton";
import { Stepper } from "@/components/Stepper";
import { SIGNUP_STEPS } from "@/screens/auth/auth";
import type { ReactNode } from "react";

export interface AuthHeaderProps {
  title: ReactNode;
  onBack?: (...args: any[]) => any;
  step?: any;
}

export function AuthHeader({ title, onBack, step }: AuthHeaderProps) {
  return (
    <Fragment>
      <header className="screen-header">
        {onBack ? <IconButton icon="caret-left" label="Retour" onClick={onBack} /> : <span />}
        <h1>{title}</h1>
        <span />
      </header>
      {step ? <div className="auth-stepper"><Stepper step={step} total={SIGNUP_STEPS.length} label={SIGNUP_STEPS[step - 1]} /></div> : null}
    </Fragment>
  );
}
