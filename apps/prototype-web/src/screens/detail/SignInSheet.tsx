import { Fragment } from "react";
import { Button } from "@/components/Button";
import { PrivacyNote } from "@/components/PrivacyNote";
import { SIGN_IN_REASONS } from "@/screens/detail/detail";
import { useActions, useStore } from "@/store/store";

export interface SignInSheetProps {
  reason?: string;
}

export function SignInSheet({ reason = "vote" }: SignInSheetProps) {
  const { dispatch } = useStore();
  const { closeSheet } = useActions();
  return (
    <Fragment>
      <p className="sheet-lead">{SIGN_IN_REASONS[reason].text}</p>
      <PrivacyNote>Votre nom public reste « Jean D. » ou « Citoyen anonyme » : jamais votre e-mail ni votre téléphone.</PrivacyNote>
      <div className="sheet-actions">
        <Button block icon="sign-in" onClick={() => dispatch({ type: "LOGOUT" })}>Se connecter</Button>
        <Button variant="tertiary" onClick={closeSheet}>Plus tard</Button>
      </div>
    </Fragment>
  );
}
