import { useSidebarContext } from "./context";

const SidebarBackground = () => {
  const context = useSidebarContext();

  return (
    <div
      class="fixed top-[3.5rem] left-0 z-overlay-dim h-[calc(100dvh-3.5rem)] w-screen bg-[rgba(0,0,0,0.6)] backdrop-blur-xs transition-opacity md:hidden"
      style={{
        "pointer-events": context.get() ? "auto" : "none",
        opacity: context.get() ? "1" : "0",
      }}
      onClick={() => context.set(false)}
    ></div>
  );
};

export default SidebarBackground;
