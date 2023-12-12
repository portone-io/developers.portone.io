import { useSignal } from "@preact/signals";

export interface DropdownProps {
  children: any;
  link: string;
  items: DropdownItem[];
}
export interface DropdownItem {
  label: any;
  link: string;
}
export default function Dropdown({ children, link, items }: DropdownProps) {
  const showItemsSignal = useSignal(false);
  return (
    <div
      class="relative inline-flex h-full cursor-default flex-col items-center"
      onMouseEnter={() => (showItemsSignal.value = true)}
      onMouseLeave={() => (showItemsSignal.value = false)}
    >
      <a class="inline-flex h-full items-center" href={link}>
        {children}
      </a>
      <div class="relative w-full">
        {showItemsSignal.value && (
          <div class="absolute flex w-max flex-col border bg-white py-2 shadow-lg">
            {items.map(({ label, link }, i) => (
              <a
                key={i}
                class="hover:bg-slate-1 inline-flex items-center gap-2 px-4 py-2"
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
