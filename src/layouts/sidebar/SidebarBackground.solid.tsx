/* @jsxImportSource solid-js */

import { isSidebarOpen, setIsSidebarOpen } from "~/state/sidebar";

const SidebarBackground = () => {
  return (
    <button
      type="button"
      class="z-5 fixed left-0 top-[3.5rem] h-[calc(100vh-3.5rem)] w-screen bg-[rgba(0,0,0,0.6)] backdrop-blur-sm transition-opacity md:hidden"
      style={{
        "pointer-events": isSidebarOpen() ? "auto" : "none",
        opacity: isSidebarOpen() ? 1 : 0,
      }}
      onClick={() => setIsSidebarOpen((prev) => !prev)}
    />
  );
};

export default SidebarBackground;
