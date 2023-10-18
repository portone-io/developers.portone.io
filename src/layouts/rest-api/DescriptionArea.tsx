import { useEffect, useRef, useState } from "preact/hooks";

export interface DescriptionAreaProps {
  maxHeightPx?: number;
  bgColor?: string;
  children: any;
}
export default function DescriptionArea({
  maxHeightPx = 16 * 12, // 12rem
  bgColor = "white",
  children,
}: DescriptionAreaProps) {
  const childrenContainerRef = useRef<HTMLDivElement>(null);
  const [maxHeightIsSmall, setMaxHeightIsSmall] = useState(false);
  const [open, setOpen] = useState(false);
  const maxHeight = open ? "" : `${maxHeightPx / 16}rem`;
  useEffect(() => {
    function checkMaxHeightIsSmall() {
      const rect = childrenContainerRef.current?.getBoundingClientRect();
      const maxHeightIsSmall = (rect?.height || 0) > maxHeightPx;
      setMaxHeightIsSmall(maxHeightIsSmall);
    }
    checkMaxHeightIsSmall();
    addEventListener("resize", checkMaxHeightIsSmall);
    return () => removeEventListener("resize", checkMaxHeightIsSmall);
  }, [maxHeightPx]);
  return (
    <div class="relative overflow-hidden" style={{ maxHeight }}>
      <div ref={childrenContainerRef}>{children}</div>
      {maxHeightIsSmall && !open && (
        <button
          class="h-2rem absolute bottom-0 flex w-full items-center justify-center text-sm font-bold"
          onClick={() => setOpen(true)}
          style={{
            background: `linear-gradient(to bottom, transparent, ${bgColor})`,
          }}
        >
          <div class="overflow-hidden rounded-full px-4 py-2 backdrop-blur-sm">
            자세히...
          </div>
        </button>
      )}
    </div>
  );
}
