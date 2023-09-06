export interface TwoColumnLayoutProps {
  className?: string;
  left: any;
  leftClassName?: string;
  right: any;
  rightClassName?: string;
  smallRight?: boolean;
  stickyRight?: boolean;
  bp?: string;
  gap?: number;
}
export default function TwoColumnLayout({
  className = "",
  left,
  leftClassName = "",
  right,
  rightClassName = "",
  smallRight = !right,
  stickyRight,
  bp = "lg",
  gap = 4,
}: TwoColumnLayoutProps) {
  return (
    <div
      class={`relative grid gap-${gap} ${bp}:${
        smallRight ? "grid-cols-[2fr_1fr]" : "grid-cols-2"
      } ${className}`}
    >
      <div class={leftClassName}>{left}</div>
      <div
        class={
          stickyRight
            ? `${bp}:sticky top-20 h-max ${rightClassName}`
            : rightClassName
        }
      >
        {right}
      </div>
    </div>
  );
}

// Ensure tailwind compilation
("gap-2 gap-4 md:grid-cols-2 md:grid-cols-[2fr_1fr] lg:grid-cols-2 lg:grid-cols-[2fr_1fr]");
