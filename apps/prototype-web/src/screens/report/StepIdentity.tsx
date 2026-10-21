import { Fragment } from "react";
import { Button } from "@/components/Button";
import { PrivacyNote } from "@/components/PrivacyNote";
import { RadioCard } from "@/components/RadioCard";
import { ReportFooter } from "@/screens/report/ReportFooter";
import { useStore } from "@/store/store";
import { publicName } from "@/utils/index";
import type { Draft } from "@/types";

/* 6.7 : deux cartes avec l'aperçu exact du nom public (H3 : le dernier choix est repris) */
export interface StepIdentityProps {
  d?: Draft;
  set?: (patch: Partial<Draft>) => void;
  next?: () => void;
}

export function StepIdentity({ d, set, next }: StepIdentityProps) {
  const { state } = useStore();
  const name = publicName(state.session.user);
  return (
    <Fragment>
      <div className="screen-pad report-body">
        <h2 className="question">Comment souhaitez-vous publier votre signalement ?</h2>
        <div className="radio-list" role="radiogroup" aria-label="Identité affichée">
          <RadioCard name="report-identity" value="profile" icon="user-circle" checked={d.identity === "profile"} onChange={(v) => set({ identity: v })}
            title="Publier avec mon profil" description={<Fragment>Les autres verront : <strong>{name}</strong></Fragment>} />
          <RadioCard name="report-identity" value="anonymous" icon="detective" iconTone="muted" checked={d.identity === "anonymous"} onChange={(v) => set({ identity: v })}
            title="Publier anonymement" description={<Fragment>Les autres verront : <strong>Citoyen anonyme</strong>. La plateforme peut retrouver l'auteur en cas d'abus.</Fragment>} />
        </div>
        <PrivacyNote>Votre e-mail, votre téléphone et votre adresse ne sont jamais affichés.</PrivacyNote>
      </div>
      <ReportFooter><Button block disabled={!d.identity} onClick={next}>Continuer</Button></ReportFooter>
    </Fragment>
  );
}
