import clsx from "clsx";
import { createMemo } from "solid-js";

interface CodeIconProps {
  fileName: string;
  class?: string;
}

export function CodeIcon(props: CodeIconProps) {
  const ext = createMemo(() => {
    return props.fileName.split(".").pop();
  });
  const icon = createMemo(() => {
    switch (ext()) {
      case "tsx":
      case "jsx":
        return "icon-[vscode-icons--file-type-reactjs]";
      case "ts":
        return "icon-[vscode-icons--file-type-typescript]";
      case "js":
        return "icon-[vscode-icons--file-type-js]";
      case "json":
        return "icon-[vscode-icons--file-type-json]";
      case "css":
        return "icon-[vscode-icons--file-type-css]";
      case "html":
        return "icon-[vscode-icons--file-type-html]";
      case "py":
        return "icon-[vscode-icons--file-type-python]";
      case "kt":
        return "icon-[vscode-icons--file-type-kotlin]";
      default:
        return "icon-[vscode-icons--default-file]";
    }
  });

  return <i class={clsx(icon(), "inline-block", props.class)} />;
}
