import { useSignal } from "@preact/signals";
import type React from "preact/compat";

import { useServerFallback } from "~/misc/useServerFallback";
import { systemVersionSignal } from "~/state/nav";
import type { SystemVersion } from "~/type";

export interface DropdownProps {
  children: React.ReactNode;
  link: string | Record<SystemVersion, string>;
  items: DropdownItem[];
  serverSystemVersion: SystemVersion;
}
export interface DropdownItem {
  label: React.ReactNode;
  link: string;
  systemVersion?: SystemVersion;
}
export default function Dropdown({
  children,
  link,
  items,
  serverSystemVersion,
}: DropdownProps) {
  const showItemsSignal = useSignal(false);
  const systemVersion = useServerFallback(
    systemVersionSignal.value,
    serverSystemVersion,
  );
  return (
    <div
      class="relative h-full inline-flex flex-col cursor-default items-center"
      onMouseEnter={() => (showItemsSignal.value = true)}
      onMouseLeave={() => (showItemsSignal.value = false)}
    >
      <a
        class="h-full inline-flex items-center"
        href={typeof link === "string" ? link : link[systemVersion]}
      >
        {children}
      </a>
      <div class="relative w-full">
        {showItemsSignal.value && (
          <div class="absolute w-max flex flex-col border bg-white py-2 shadow-lg">
            {items.map(({ label, link, systemVersion }, i) => (
              <a
                key={i}
                class="inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-1"
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
