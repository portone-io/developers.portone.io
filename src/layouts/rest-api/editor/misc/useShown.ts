import { useEffect, useRef, useState } from "preact/hooks";

export default function useShown() {
  const domRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      setShown(true);
      observer.disconnect();
    });
    observer.observe(domRef.current!);
    return () => observer.disconnect();
  }, []);
  return { domRef, shown };
}
