import type React from "preact/compat";

export interface TwoColumnLayoutProps {
  className?: string;
  left: React.ReactNode;
  leftClassName?: string;
  right: React.ReactNode;
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
        smallRight ? "grid-cols-[3fr_2fr]" : "grid-cols-2"
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
("gap-2 gap-4 gap-6 md:grid-cols-2 md:grid-cols-[3fr_2fr] lg:grid-cols-2 lg:grid-cols-[3fr_2fr]");
