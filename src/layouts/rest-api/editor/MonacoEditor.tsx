import { clientOnly } from "@solidjs/start";

export type {
  IStandaloneCodeEditor,
  ITextModel,
  MonacoEditorProps,
} from "./MonacoEditorCore";

type monaco = typeof import("monaco-editor");
type editor = monaco["editor"];
type IStandaloneEditorConstructionOptions = NonNullable<
  Parameters<editor["create"]>[1]
>;

export const commonEditorConfig: IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  lineNumbersMinChars: 3,
  folding: false,
  tabSize: 2,
  minimap: { enabled: false },
};

export default clientOnly(() => import("./MonacoEditorCore"));
