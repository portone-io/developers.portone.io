import clsx from "clsx";
import { useState } from "react";

interface Props {
  class?: string;
  activeTag: string;
}

export const navMap = {
  "/blog": "전체보기",
  ...Object.fromEntries(
    ["Backend", "Frontend", "Infra", "Core V1", "Core V2"].map((tag) => [
      `/blog/tags/${encodeURIComponent(tag)}`,
      tag,
    ]),
  ),
};

export default function NavigationMenu(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div class={clsx("relative", props.class)}>
      <button
        type="button"
        class={clsx(
          "flex w-full items-center justify-between gap-1 rounded-md px-4 py-2 text-[1.125rem] font-medium text-slate-600 transition-colors duration-200 hover:bg-[#F4F4F5] max-sm:border lg:hidden",
          open && "bg-[#F4F4F580]",
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        {props.activeTag}
        <i
          class={clsx(
            "inline-block",
            open
              ? "icon-[ic--outline-keyboard-arrow-up]"
              : "icon-[ic--outline-keyboard-arrow-down]",
          )}
        />
      </button>
      <div
        class={clsx(
          "transform transition-all duration-200",
          !open &&
            "max-lg:pointer-events-none max-lg:scale-95 max-lg:opacity-0",
        )}
      >
        <ul
          class={clsx(
            "flex gap-x-5 overflow-x-auto py-2 whitespace-nowrap",
            "max-lg:absolute max-lg:top-full max-lg:right-0 max-lg:mt-1.5 max-lg:flex-col max-lg:rounded-md max-lg:border max-lg:bg-white max-lg:px-4 max-lg:py-2 max-lg:shadow-lg",
            "max-sm:left-0",
          )}
        >
          {Object.entries(navMap).map(([path, tag]) => (
            <li
              class={clsx(
                "hover:text-slate-9 text-[1.125rem] transition-colors duration-200",
                "max-lg:text-slate-9 max-lg:hover:bg-slate-1 max-lg:flex max-lg:items-center max-lg:gap-3 max-lg:rounded-md max-lg:px-1 max-lg:py-2",
                props.activeTag === tag
                  ? "lg:text-slate-9 lg:font-semibold"
                  : "lg:text-slate-4",
                path === "/blog" && "max-lg:!hidden",
              )}
            >
              <i
                class={clsx(
                  "icon-[ic--baseline-check] inline-block lg:hidden",
                  props.activeTag !== tag && "invisible",
                )}
              />
              <a href={path} class="block w-full">
                {tag}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
