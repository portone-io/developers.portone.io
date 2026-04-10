import clsx from "clsx";
import { For, Show } from "solid-js";

interface Props {
  tags: string[];
  variant?: "default" | "compact";
}

export default function TagList(props: Props) {
  return (
    <Show when={props.tags.length > 0}>
      <div
        class={clsx(
          "flex",
          props.variant === "compact" ? "gap-1 text-sm" : "gap-2 text-base",
        )}
      >
        <i
          class={clsx(
            "icon-[ic--baseline-label] text-slate-4 inline-block",
            props.variant === "compact"
              ? "h-[18px] text-base"
              : "h-[18px] text-lg",
          )}
        />
        <ul
          class={clsx(
            "m-0 flex list-none flex-row flex-wrap p-0",
            props.variant === "compact" ? "gap-x-2 gap-y-1" : "gap-x-3 gap-y-2",
          )}
        >
          <For each={props.tags}>
            {(tag) => (
              <li class="text-slate-4 hover:text-slate-5 leading-[18px] transition-colors">
                <a href={`/blog/tags/${encodeURIComponent(tag)}`}>{tag}</a>
              </li>
            )}
          </For>
        </ul>
      </div>
    </Show>
  );
}
