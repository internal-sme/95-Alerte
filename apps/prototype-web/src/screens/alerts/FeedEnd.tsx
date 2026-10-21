import { Icon } from "@/components/Icon";

export interface FeedEndProps {
  onTop: (...args: any[]) => any;
}

export function FeedEnd({ onTop }: FeedEndProps) {
  return (
    <div className="feed-end">
      <Icon name="check-circle" />
      <p><b>Vous êtes à jour.</b>Les alertes disparaissent 24 h après leur publication.</p>
      <button type="button" className="btn btn-tertiary" onClick={onTop}>Revenir en haut</button>
    </div>
  );
}
