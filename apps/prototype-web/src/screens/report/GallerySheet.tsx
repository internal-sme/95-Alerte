import { Fragment } from "react";
import { Icon } from "@/components/Icon";
import { ALERT_PHOTOS, PHOTO_ALT } from "@/data/photos";
import { MAX_PHOTOS, demoGallery } from "@/screens/report/report";
import { useActions, useStore } from "@/store/store";

export function GallerySheet() {
  const { state, dispatch } = useStore();
  const { closeSheet } = useActions();
  const used = new Set((state.draft?.photos || []).map((ph) => ph.key));
  const full = (state.draft?.photos || []).length >= MAX_PHOTOS;
  return (
    <Fragment>
      <div className="gallery-grid">
        {demoGallery().filter((k) => ALERT_PHOTOS[k]).map((k) => (
          <button key={k} type="button" className="gallery-item" disabled={used.has(k) || full} aria-label={`${used.has(k) ? "Déjà ajoutée : " : "Ajouter : "}${PHOTO_ALT[k]}`}
            onClick={() => { dispatch({ type: "DRAFT_PHOTO", photo: { id: `ph-${Date.now()}`, key: k, status: "uploading", progress: 0 } }); closeSheet(); }}>
            <img src={ALERT_PHOTOS[k]} alt="" />{used.has(k) ? <span className="ms-check" style={{ display: "grid" }}><Icon name="check" /></span> : null}
          </button>
        ))}
      </div>
      <p className="demo-note">Galerie de démonstration : photos générées pour le prototype.</p>
    </Fragment>
  );
}
