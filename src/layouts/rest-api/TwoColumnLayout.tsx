export interface TwoColumnLayoutProps {
  className?: string;
  left: any;
  right: any;
  stickyRight?: boolean;
  bp?: string;
  gap?: number;
}
export default function TwoColumnLayout({
  className = "",
  left,
  right,
  stickyRight,
  bp = "lg",
  gap = 4,
}: TwoColumnLayoutProps) {
  const rightClass = stickyRight ? `${bp}:sticky top-20 h-max` : "";
  return (
    <div class={`relative grid gap-${gap} ${bp}:grid-cols-2 ${className}`}>
      <div>{left}</div>
      <div class={rightClass}>{right}</div>
    </div>
  );
}
