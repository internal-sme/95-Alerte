import { Fragment } from "react";
import { RadioCard } from "@/components/RadioCard";
import { useActions, useStore } from "@/store/store";
import { publicName } from "@/utils/index";

/* I1 : même règle que les alertes, choisie dans le champ ; le dernier choix est repris */
export function CommentIdentitySheet() {
  const { state, dispatch } = useStore();
  const { closeSheet } = useActions();
  const value = state.prefs.lastCommentIdentity || "profile";
  const pick = (v) => { dispatch({ type: "SET_PREF", key: "lastCommentIdentity", value: v }); closeSheet(); };
  return (
    <div className="radio-list" role="radiogroup" aria-label="Commenter en tant que">
      <RadioCard name="comment-identity" value="profile" icon="user-circle" checked={value === "profile"} onChange={pick}
        title="Avec mon profil" description={<Fragment>Les autres verront : <strong>{publicName(state.session.user)}</strong></Fragment>} />
      <RadioCard name="comment-identity" value="anonymous" icon="detective" iconTone="muted" checked={value === "anonymous"} onChange={pick}
        title="Anonymement" description={<Fragment>Les autres verront : <strong>Citoyen anonyme</strong>. La plateforme peut retrouver l'auteur en cas d'abus.</Fragment>} />
    </div>
  );
}
