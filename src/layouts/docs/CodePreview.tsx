import { children, type FlowComponent, type JSXElement } from "solid-js";
import { Portal } from "solid-js/web";

export function CodePreview<Params extends object>(props: Props<Params>) {
  const c = children(() => props.children);
  const ref: HTMLDivElement | undefined = undefined;
  return (
    <>
      <div>{props.children}</div>
      <Portal mount={document.getElementById("docs-right-sidebar")!} ref={ref}>
        <div class="w-133">todo</div>
      </Portal>
    </>
  );
}
