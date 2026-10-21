import { Fragment } from "react";
import { Icon } from "@/components/Icon";
import { PrivacyNote } from "@/components/PrivacyNote";
import { TypeBadge } from "@/components/TypeBadge";
import { CATEGORY_BY_ID, COMMUNE_BY_ID } from "@/data/seed";
import { shareUrl } from "@/screens/detail/detail";
import { useActions, useNow, useStore } from "@/store/store";
import { cx, fmtRemaining } from "@/utils/index";

/* 5.7 : partage simulé ; l'aperçu montre exactement ce qui part (Medium, Lex) */
export interface ShareSheetProps {
  id?: string;
}

export function ShareSheet({ id }: ShareSheetProps) {
  const { state } = useStore();
  const { closeSheet, toast } = useActions();
  const now = useNow();
  const alert = state.alerts.find((a) => a.id === id);
  if (!alert) return null;
  const cat = CATEGORY_BY_ID[alert.categoryId];
  const left = alert.expiresAt - now;
  const url = shareUrl(alert);
  const copy = () => {
    try { navigator.clipboard?.writeText(url).catch(() => {}); } catch (e) { /* presse-papiers indisponible : le lien reste affiché */ }
    closeSheet();
    toast("Lien copié.");
  };
  const simulated = (via) => { closeSheet(); toast(`Partage par ${via} simulé : aucun message n'est envoyé depuis le prototype.`, { tone: "info" }); };
  return (
    <Fragment>
      <div className={cx("share-card", `fam-${cat.family}`)}>
        <TypeBadge category={cat} />
        <b>{alert.title}</b>
        <span>{COMMUNE_BY_ID[alert.communeId].name} · {left > 0 ? `visible encore ${fmtRemaining(left)}` : "alerte expirée"}</span>
        <span className="share-url">{url.replace("https://", "")}</span>
      </div>
      <div className="share-actions">
        <button type="button" onClick={copy}><span><Icon name="link" /></span>Copier le lien</button>
        <button type="button" onClick={() => simulated("SMS")}><span><Icon name="chat-text" /></span>SMS</button>
        <button type="button" onClick={() => simulated("WhatsApp")}><span><Icon name="whatsapp-logo" /></span>WhatsApp</button>
        <button type="button" onClick={() => simulated("une autre application")}><span><Icon name="dots-three" /></span>Plus…</button>
      </div>
      <PrivacyNote>Le lien ne contient aucune donnée personnelle : ni l'auteur, ni votre position.</PrivacyNote>
    </Fragment>
  );
}
