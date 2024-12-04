import { Dynamic } from "solid-js/web";

import { useInteractiveDocs } from "~/state/interactive-docs";

export function CodePreview() {
  const { preview } = useInteractiveDocs();
  return (
    <div class="grid grid-rows-[auto_auto] bg-slate-8 pt-2">
      <div class="rounded-t-lg bg-slate-5 px-4 py-2">
        <span class="text-sm text-slate-3 font-medium">미리보기</span>
      </div>
      <Dynamic component={preview()} />
    </div>
  );
}
