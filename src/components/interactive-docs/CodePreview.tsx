import { Collapsible } from "@kobalte/core/collapsible";
import clsx from "clsx";
import { Dynamic, Show } from "solid-js/web";

import { useInteractiveDocs } from "~/state/interactive-docs";

export function CodePreview() {
  const { preview } = useInteractiveDocs();

  return (
    <Collapsible
      class={clsx(
        "grid grid-rows-[auto_auto] bg-slate-8",
        preview() ? "pt-2" : "",
      )}
      forceMount
      defaultOpen
    >
      <Show when={preview()}>
        <Collapsible.Trigger class="flex gap-2 rounded-t-lg bg-slate-5 px-4 py-2 [&[data-expanded]>i]:transform-rotate-180">
          <i class="i-ic-baseline-keyboard-arrow-down text-xl text-slate-3 font-medium" />
          <span class="text-sm text-slate-3 font-medium">미리보기</span>
        </Collapsible.Trigger>
        <Collapsible.Content class="data-[closed]:hidden">
          <Dynamic component={preview()} />
        </Collapsible.Content>
      </Show>
    </Collapsible>
  );
}
