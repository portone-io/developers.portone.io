import React from "react";
import { sidebarOpenSignal } from "~/state/sidebar";

const SidebarBackground = () => {
  const a = sidebarOpenSignal.value;
  React.useEffect(() => {
    console.log(a);
  }, []);
  return (
    <div
      class="absolute left-0 top-0 h-screen w-screen bg-[rgba(0,0,0,0.6)] md:hidden"
      onClick={() => (sidebarOpenSignal.value = false)}
    ></div>
  );
};

export default SidebarBackground;
