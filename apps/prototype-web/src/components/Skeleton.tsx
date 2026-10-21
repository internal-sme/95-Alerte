export interface SkeletonProps {
  height?: any;
  width?: any;
  radius?: any;
}

export function Skeleton({ height = 14, width = "100%", radius }: SkeletonProps) {
  return <div className="skeleton" aria-hidden="true" style={{ height, width, borderRadius: radius }} />;
}
