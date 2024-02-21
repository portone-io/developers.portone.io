import clsx from "clsx";
import { useState, type ReactNode } from "react";

interface Props {
  class?: string;
  activeTag: string;
  children: ReactNode;
}

export default function NavigationMenu(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div class={clsx("relative", props.class)}>
      <button
        type="button"
        class={clsx(
          "text-1.125rem hover:bg-#F4F4F5 <sm:border flex w-full items-center justify-between gap-1 rounded-md px-4 py-2 font-medium text-slate-600 transition-colors duration-200 lg:hidden",
          open && "bg-#F4F4F580",
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        {props.activeTag}
        <i
          class={clsx(
            "inline-block",
            open
              ? "i-ic-outline-keyboard-arrow-up"
              : "i-ic-outline-keyboard-arrow-down",
          )}
        />
      </button>
      <div
        class={clsx(
          "transform transition-all duration-200",
          !open && "<lg:opacity-0 <lg:scale-95 <lg:pointer-events-none",
        )}
      >
        {props.children}
      </div>
    </div>
  );
}
