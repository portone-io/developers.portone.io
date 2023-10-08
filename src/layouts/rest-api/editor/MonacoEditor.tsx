import { useEffect, useRef } from "preact/hooks";

type monaco = typeof import("monaco-editor");
type editor = monaco["editor"];
export type ITextModel = ReturnType<editor["createModel"]>;
export type IStandaloneCodeEditor = ReturnType<editor["create"]>;
type IStandaloneEditorConstructionOptions = NonNullable<
  Parameters<editor["create"]>[1]
>;

export interface MonacoEditorProps {
  init: (monaco: monaco, domElement: HTMLElement) => IStandaloneCodeEditor;
}
export default function MonacoEditor({ init }: MonacoEditorProps) {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const p = import("monaco-editor").then((monaco) =>
      init(monaco, divRef.current!)
    );
    return () => p.then((editor) => editor.dispose());
  }, []);
  return (
    <div class="relative flex-1">
      <div ref={divRef} class="absolute h-full w-full" />
    </div>
  );
}

export const commonEditorConfig: IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  lineNumbersMinChars: 3,
  folding: false,
  tabSize: 2,
  minimap: { enabled: false },
};
