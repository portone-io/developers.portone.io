import { Dynamic } from "solid-js/web";

import { useInteractiveDocs } from "~/state/interactive-docs";

export function CodePreview() {
  const { preview } = useInteractiveDocs();
  return (
    <div class="grid bg-slate-8 pt-2">
      <Dynamic component={preview()} />
    </div>
  );
}
