import { type JSXElement } from "solid-js";
import { Portal } from "solid-js/web";

interface Props {
  children?: JSXElement;
}

export default function CodePreview(props: Props) {
  return (
    <>
      <div>{props.children}</div>
      <Portal mount={document.getElementById("docs-right-sidebar")!}>
        <div class="w-133">test</div>
      </Portal>
    </>
  );
}
