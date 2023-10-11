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
  onChange?: (value: string) => void;
}
export default function MonacoEditor({ init, onChange }: MonacoEditorProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => void (onChangeRef.current = onChange), [onChange]);
  useEffect(() => {
    const p = Promise.all([
      import("monaco-editor"),
      import("./misc/scrollFinished"),
    ]).then(([monaco, { default: scrollFinished }]) =>
      // 브라우저의 smooth scrollTo 중에 dom 수정이 일어나면 스크롤이 도중 끊겨버리기 때문에
      // 스크롤이 끝났다고 판단됐을 때 monaco editor를 초기화한다.
      scrollFinished().then(() => {
        const editor = init(monaco, divRef.current!);
        const changeEventListener = editor.onDidChangeModelContent(() =>
          onChangeRef.current?.(editor.getValue())
        );
        return () => {
          changeEventListener.dispose();
          editor.dispose();
        };
      })
    );
    return () => p.then((dispose) => dispose());
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
