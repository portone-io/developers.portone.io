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
        <ul
          class={clsx(
            "flex gap-x-5 overflow-x-auto whitespace-nowrap py-2",
            // prettier-ignore
            "lt-lg:(absolute shadow-lg right-0 top-full mt-1.5 flex-col rounded-md border bg-white px-4 py-2)",
            "<sm:left-0",
          )}
        >
          {Object.entries(navMap).map(([path, tag]) => (
            <li
              class={clsx(
                "text-1.125rem hover:text-slate-9 transition-colors duration-200",
                "<lg:text-slate-9 <lg:hover:bg-slate-1 <lg:px-1 <lg:py-2 <lg:rounded-md <lg:flex <lg:items-center <lg:gap-3",
                props.activeTag === tag
                  ? "lg:(text-slate-9 font-semibold)"
                  : "lg:text-slate-4",
                path === "/blog" && "<lg:!hidden",
              )}
            >
              <i
                class={clsx(
                  "i-ic-baseline-check inline-block lg:hidden",
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
