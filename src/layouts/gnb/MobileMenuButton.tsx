import { untrack } from "solid-js";

import { useSidebarContext } from "~/layouts/sidebar/context";

const MobileMenuButton = () => {
  const { get: sidebarOpen, set: setSidebarOpen } = useSidebarContext();

  return (
    <div class="flex h-full justify-end md:hidden">
      <button
        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-primary transition-colors hover:bg-surface-muted"
        onClick={() => setSidebarOpen(!untrack(sidebarOpen))}
      >
        <i
          class="block text-2xl"
          classList={{
            "icon-[ic--baseline-close]": sidebarOpen(),
            "icon-[ic--baseline-menu]": !sidebarOpen(),
          }}
        />
      </button>
    </div>
  );
};

export default MobileMenuButton;
