import { untrack } from "solid-js";

import { useSidebarContext } from "~/layouts/sidebar/context";

const MobileMenuButton = () => {
  const { get: sidebarOpen, set: setSidebarOpen } = useSidebarContext();

  return (
    <div class="h-full flex md:hidden">
      <button
        class="px-4"
        onClick={() => setSidebarOpen(!untrack(sidebarOpen))}
      >
        <i
          class="block text-2xl"
          classList={{
            "i-ic-baseline-close": sidebarOpen(),
            "i-ic-baseline-menu": !sidebarOpen(),
          }}
        />
      </button>
    </div>
  );
};

export default MobileMenuButton;
