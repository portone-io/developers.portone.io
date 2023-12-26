import { useSignal } from "@preact/signals";
import { useServerFallback } from "~/misc/useServerFallback";
import { systemVersionSignal } from "~/state/nav";
import type { SystemVersion } from "~/type";

export interface DropdownProps {
  children: any;
  link: string | Record<SystemVersion, string>;
  items: DropdownItem[];
}
export interface DropdownItem {
  label: any;
  link: string;
  systemVersion?: SystemVersion;
}
export default function Dropdown({ children, link, items }: DropdownProps) {
  const showItemsSignal = useSignal(false);
  const systemVersion = useServerFallback(systemVersionSignal.value, "all");
  return (
    <div
      class="relative inline-flex h-full cursor-default flex-col items-center"
      onMouseEnter={() => (showItemsSignal.value = true)}
      onMouseLeave={() => (showItemsSignal.value = false)}
    >
      <a
        class="inline-flex h-full items-center"
        href={typeof link === "string" ? link : link[systemVersion]}
      >
        {children}
      </a>
      <div class="relative w-full">
        {showItemsSignal.value && (
          <div class="absolute flex w-max flex-col border bg-white py-2 shadow-lg">
            {items.map(({ label, link, systemVersion }, i) => (
              <a
                key={i}
                class="hover:bg-slate-1 inline-flex items-center gap-2 px-4 py-2"
                data-system-version={systemVersion}
                href={link}
              >
                {label}
                {link.startsWith("https://") && (
                  <i class="i-ic-baseline-launch opacity-40" />
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
