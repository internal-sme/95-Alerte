import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { ALERT_PHOTOS, PHOTO_ALT } from "@/data/photos";
import { cx } from "@/utils/index";
import type { DraftPhoto } from "@/types";

export interface PhotoThumbProps {
  ph: DraftPhoto;
  onRemove: (...args: any[]) => any;
  onRetry: (...args: any[]) => any;
}

export function PhotoThumb({ ph, onRemove, onRetry }: PhotoThumbProps) {
  return (
    <div className={cx("photo-thumb", ph.status === "error" && "is-error")}>
      {ph.src ? <img src={ph.src} alt="Photo prise avec l'appareil photo" /> : ALERT_PHOTOS[ph.key] ? <img src={ALERT_PHOTOS[ph.key]} alt={PHOTO_ALT[ph.key]} /> : null}
      {ph.status === "uploading" ? <span className="pt-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ph.progress} aria-label="Envoi de la photo"><i style={{ width: `${ph.progress}%` }} /><small>{ph.progress < 40 ? "Compression…" : `Envoi ${ph.progress} %`}</small></span> : null}
      {ph.status === "error" ? <button type="button" className="pt-retry" onClick={onRetry}><Icon name="arrows-clockwise" />Réessayer</button> : null}
      <IconButton icon="x" label="Retirer la photo" className="pt-remove" onClick={onRemove} />
    </div>
  );
}
