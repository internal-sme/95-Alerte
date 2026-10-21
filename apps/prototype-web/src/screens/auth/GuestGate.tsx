import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/store/store";
import type { ReactNode } from "react";

/* Écrans en mode invité */
export interface GuestGateProps {
  icon: string;
  title: ReactNode;
  text: ReactNode;
}

export function GuestGate({ icon, title, text }: GuestGateProps) {
  const { dispatch } = useStore();
  return (
    <EmptyState icon={icon} title={title} action={<Button icon="sign-in" onClick={() => dispatch({ type: "LOGOUT" })}>Se connecter</Button>}>{text}</EmptyState>
  );
}
