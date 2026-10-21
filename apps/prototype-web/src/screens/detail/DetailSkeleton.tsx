import { IconButton } from "@/components/IconButton";
import { Skeleton } from "@/components/Skeleton";
import { useActions } from "@/store/store";

export function DetailSkeleton() {
  const { pop } = useActions();
  return (
    <div className="screen detail-screen" aria-busy="true" aria-label="Chargement de l'alerte">
      <div className="detail-hero"><Skeleton height="100%" radius={0} /><div className="detail-top"><IconButton icon="caret-left" label="Retour" onClick={pop} /></div></div>
      <div className="detail-body">
        <Skeleton height={24} width="40%" radius={12} />
        <Skeleton height={28} width="90%" />
        <Skeleton height={16} width="70%" />
        <Skeleton height={44} radius={12} />
        <Skeleton height={64} />
        <Skeleton height={48} radius={12} />
      </div>
    </div>
  );
}
