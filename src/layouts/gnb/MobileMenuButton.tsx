import { sidebarOpenSignal } from "~/state/sidebar";

const MobileMenuButton = () => {
  return (
    <div class="flex h-full md:hidden">
      <button class="px-4" onClick={() => (sidebarOpenSignal.value = true)}>
        <i class="i-ic-baseline-menu block text-2xl"></i>
      </button>
    </div>
  );
};

export default MobileMenuButton;
