import type { ParentProps } from "solid-js";

export function InteractiveDocs(props: ParentProps) {
  return (
    <div class="grid-cols-[1.2fr_1fr]">
      <div>{props.children}</div>
    </div>
  );
}
