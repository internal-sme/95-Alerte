import { IconButton } from "@/components/IconButton";
import { useActions } from "@/store/store";
import type { ReactNode } from "react";

export interface ScreenHeaderProps {
  title: ReactNode;
  onBack?: (...args: any[]) => any;
  action?: any;
  close?: boolean;
}

export function ScreenHeader({ title, onBack, action, close }: ScreenHeaderProps) {
  const { pop } = useActions();
  return (
    <header className="screen-header">
      <IconButton icon={close ? "x" : "caret-left"} label={close ? "Fermer" : "Retour"} onClick={onBack || pop} />
      <h1>{title}</h1>
      {action || <span />}
    </header>
  );
}
