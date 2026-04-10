import { Collapsible } from "@kobalte/core/collapsible";
import clsx from "clsx";
import { Dynamic, Show } from "solid-js/web";

import { useInteractiveDocs } from "~/state/interactive-docs";

export function CodePreview() {
  const { preview } = useInteractiveDocs();

  return (
    <Collapsible
      class={clsx(
        "bg-slate-8 grid grid-rows-[auto_auto]",
        preview() ? "pt-2" : "",
      )}
      forceMount
      defaultOpen
    >
      <Show when={preview()}>
        <Collapsible.Trigger class="bg-slate-5 flex gap-2 rounded-t-lg px-4 py-2 [&[data-expanded]>i]:rotate-180">
          <i class="icon-[ic--baseline-keyboard-arrow-down] text-slate-3 text-xl font-medium" />
          <span class="text-slate-3 text-sm font-medium">미리보기</span>
        </Collapsible.Trigger>
        <Collapsible.Content class="data-[closed]:hidden">
          <Dynamic component={preview()} />
        </Collapsible.Content>
      </Show>
    </Collapsible>
  );
}
