import { sidebarOpenSignal } from "~/state/sidebar";

const SidebarBackground = () => {
  const sidebarOpen = sidebarOpenSignal.value;
  return (
    <div
      class="fixed left-0 top-[3.5rem] z-5 h-[calc(100vh-3.5rem)] w-screen bg-[rgba(0,0,0,0.6)] backdrop-blur-sm transition-opacity md:hidden"
      style={{
        pointerEvents: sidebarOpen ? "auto" : "none",
        opacity: sidebarOpen ? 1 : 0,
      }}
      onClick={() => (sidebarOpenSignal.value = false)}
    ></div>
  );
};

export default SidebarBackground;
