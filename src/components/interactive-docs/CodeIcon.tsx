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
        return "i-vscode-icons-file-type-reactjs";
      case "ts":
        return "i-vscode-icons-file-type-typescript";
      case "js":
        return "i-vscode-icons-file-type-js";
      case "json":
        return "i-vscode-icons-file-type-json";
      case "css":
        return "i-vscode-icons-file-type-css";
      case "html":
        return "i-vscode-icons-file-type-html";
      default:
        return "i-vscode-icons-default-file";
    }
  });

  return <i class={clsx(icon(), "inline-block", props.class)} />;
}
