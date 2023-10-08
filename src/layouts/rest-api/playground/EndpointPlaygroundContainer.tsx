import { useEffect, useRef, useState } from "preact/hooks";

export interface EndpointPlaygroundContainerProps {
  children: any;
}
export default function EndpointPlaygroundContainer({
  children,
}: EndpointPlaygroundContainerProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      setMounted(true);
      observer.disconnect();
    });
    observer.observe(divRef.current!);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={divRef}
      class="top-4rem sticky flex h-[calc(100vh-10rem)] flex-col gap-1"
    >
      {mounted && children}
    </div>
  );
}
