import { Fragment, useState } from "react";
import { Button } from "@/components/Button";
import { PrivacyNote } from "@/components/PrivacyNote";
import { RadioCard } from "@/components/RadioCard";
import { FOLLOW_LEVELS, FOLLOW_TOAST } from "@/screens/detail/detail";
import { useActions, useStore } from "@/store/store";

export interface FollowSheetProps {
  id?: string;
}

export function FollowSheet({ id }: FollowSheetProps) {
  const { state, dispatch } = useStore();
  const { closeSheet, toast } = useActions();
  const current = state.follows[id];
  const [level, setLevel] = useState(current || state.prefs.followLevel || "all");
  return (
    <Fragment>
      <div className="radio-list" role="radiogroup" aria-label="Notifications pour cette alerte">
        {FOLLOW_LEVELS.map((o) => <RadioCard key={o.value} name="follow-level" value={o.value} checked={level === o.value} onChange={setLevel} icon={o.icon} iconTone={o.value === "none" ? "muted" : "primary"} title={o.title} description={o.description} />)}
      </div>
      <PrivacyNote icon="gear">Modifiable à tout moment depuis la fiche ou les réglages de notifications.</PrivacyNote>
      <div className="sheet-actions">
        <Button block onClick={() => { dispatch({ type: "FOLLOW", alertId: id, level }); closeSheet(); toast(FOLLOW_TOAST[level]); }}>{current ? "Enregistrer" : "Suivre cette alerte"}</Button>
        {current ? <Button variant="tertiary" onClick={() => { dispatch({ type: "UNFOLLOW", alertId: id }); closeSheet(); toast("Vous ne suivez plus cette alerte."); }}>Ne plus suivre</Button> : null}
      </div>
    </Fragment>
  );
}
