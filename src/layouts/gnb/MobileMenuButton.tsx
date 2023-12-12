import { sidebarOpenSignal } from "~/state/sidebar";

const MobileMenuButton = () => {
  const sidebarOpen = sidebarOpenSignal.value;
  return (
    <div class="flex h-full md:hidden">
      <button
        class="px-4"
        onClick={() => (sidebarOpenSignal.value = !sidebarOpenSignal.value)}
      >
        {sidebarOpen ? (
          <i class="i-ic-baseline-close block text-2xl"></i>
        ) : (
          <i class="i-ic-baseline-menu block text-2xl"></i>
        )}
      </button>
    </div>
  );
};

export default MobileMenuButton;
