import { useSidebarContext } from "./context";

const SidebarBackground = () => {
  const context = useSidebarContext();

  return (
    <div
      class="z-overlay-dim fixed top-[3.5rem] left-0 h-[calc(100dvh-3.5rem)] w-screen bg-[rgba(0,0,0,0.6)] backdrop-blur-sm transition-opacity md:hidden"
      style={{
        "pointer-events": context.get() ? "auto" : "none",
        opacity: context.get() ? "1" : "0",
      }}
      onClick={() => context.set(false)}
    ></div>
  );
};

export default SidebarBackground;
