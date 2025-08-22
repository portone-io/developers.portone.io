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
          "w-full flex items-center justify-between gap-1 rounded-md px-4 py-2 text-1.125rem text-slate-600 font-medium transition-colors duration-200 lg:hidden <sm:border hover:bg-#F4F4F5",
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
          !open && "<lg:pointer-events-none <lg:scale-95 <lg:opacity-0",
        )}
      >
        <ul
          class={clsx(
            "flex gap-x-5 overflow-x-auto whitespace-nowrap py-2",
            // prettier-ignore
            "lt-lg:(absolute right-0 top-full mt-1.5 flex-col border rounded-md bg-white px-4 py-2 shadow-lg)",
            "<sm:left-0",
          )}
        >
          {Object.entries(navMap).map(([path, tag]) => (
            <li
              class={clsx(
                "text-1.125rem transition-colors duration-200 hover:text-slate-9",
                "<lg:flex <lg:items-center <lg:gap-3 <lg:rounded-md <lg:px-1 <lg:py-2 <lg:text-slate-9 <lg:hover:bg-slate-1",
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
