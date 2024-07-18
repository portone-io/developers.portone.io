import { onCleanup, onMount } from "solid-js";

import once from "./misc/once";

type monaco = typeof import("monaco-editor");
type editor = monaco["editor"];
export type ITextModel = ReturnType<editor["createModel"]>;
export type IStandaloneCodeEditor = ReturnType<editor["create"]>;
type IStandaloneEditorConstructionOptions = NonNullable<
  Parameters<editor["create"]>[1]
>;

const doCreateTheme = once();

export interface MonacoEditorProps {
  init: (monaco: monaco, domElement: HTMLElement) => IStandaloneCodeEditor;
  onChange?: ((value: string) => void) | undefined;
}
export default function MonacoEditor(props: MonacoEditorProps) {
  let divRef: HTMLDivElement | undefined;
  onMount(() => {
    const p = Promise.all([
      import("monaco-editor"),
      import("./misc/scrollFinished"),
      import("./misc/install-monaco-worker").then(({ installWorkers }) =>
        installWorkers(),
      ),
    ]).then(async ([monaco, { default: scrollFinished }]) => {
      doCreateTheme(() => {
        monaco.editor.defineTheme("portone", {
          base: "vs",
          inherit: true,
          rules: [],
          colors: {
            "editorGutter.background": "#f1f5f9",
          },
        });
        monaco.editor.setTheme("portone");
      });
      // 브라우저의 smooth scrollTo 중에 dom 수정이 일어나면 스크롤이 도중 끊겨버리기 때문에
      // 스크롤이 끝났다고 판단됐을 때 monaco editor를 초기화한다.
      await scrollFinished();
      const editor = props.init(monaco, divRef!);
      const changeEventListener = editor.onDidChangeModelContent(() =>
        props.onChange?.(editor.getValue()),
      );
      return () => {
        changeEventListener.dispose();
        editor.dispose();
      };
    });
    onCleanup(() => void p.then((dispose) => dispose()));
  });
  return (
    <div class="relative h-full w-full">
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
