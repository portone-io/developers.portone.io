/* @jsxImportSource solid-js */

import { Show } from "solid-js";
import { isSidebarOpen, setIsSidebarOpen } from "~/state/sidebar";

const MobileMenuButton = () => {
  return (
    <div class="flex h-full md:hidden">
      <button
        type="button"
        class="px-4"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        <Show
          when={isSidebarOpen()}
          fallback={<i class="i-ic-baseline-menu block text-2xl" />}
        >
          <i class="i-ic-baseline-close block text-2xl" />
        </Show>
      </button>
    </div>
  );
};

export default MobileMenuButton;
