import { AuthHeader } from "@/screens/auth/AuthHeader";
import type { ReactNode } from "react";

/* Gabarit commun des étapes de connexion et d'inscription (benchmark P1 : une question par écran,
   un seul CTA principal, toujours au même endroit, dans le pied d'écran) */
export interface AuthStepProps {
  title: ReactNode;
  step?: number;
  onBack: (...args: any[]) => any;
  question: string;
  lead: ReactNode;
  onSubmit: (...args: any[]) => any;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthStep({ title, step, onBack, question, lead, onSubmit, footer, children }: AuthStepProps) {
  return (
    <form className="screen auth" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
      <AuthHeader title={title} step={step} onBack={onBack} />
      <div className="screen-pad">
        <div className="auth-intro">
          <h2 className="question">{question}</h2>
          {lead ? <p className="auth-lead">{lead}</p> : null}
        </div>
        {children}
      </div>
      <div className="screen-footer stack-footer">{footer}</div>
    </form>
  );
}
