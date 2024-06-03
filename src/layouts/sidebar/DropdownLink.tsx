import { useSignal } from "@preact/signals";
import clsx from "clsx";
import type React from "preact/compat";

export interface DropdownLinkProps {
  children: React.ReactNode;
  items: DropdownItem[];
}
export interface DropdownItem {
  label: React.ReactNode;
  link: string;
}
export default function DropdownLink({ children, items }: DropdownLinkProps) {
  const showItemsSignal = useSignal(false);
  return (
    <div class="relative h-full w-full flex flex-col cursor-default">
      <button
        class="flex flex-1 items-center gap-2 border-1 border-slate-3 rounded-6px p-2 px-4 text-slate-600"
        onClick={() => (showItemsSignal.value = !showItemsSignal.value)}
      >
        {children}
        <div class="flex-1" />
        <i
          class={clsx(
            "text-xl",
            showItemsSignal.value
              ? "i-ic-baseline-keyboard-arrow-up"
              : "i-ic-baseline-keyboard-arrow-down",
          )}
        ></i>
      </button>
      <div class="relative w-full z-dropdown-link">
        {showItemsSignal.value && (
          <div class="absolute w-full flex flex-col border bg-white py-2 shadow-lg">
            {items.map(({ label, link }, i) => (
              <a
                key={i}
                class="inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-1"
                href={link}
              >
                <i
                  class={clsx(
                    "i-ic-baseline-check",
                    location.pathname.startsWith(link) || "opacity-0",
                  )}
                />
                <span>{label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
