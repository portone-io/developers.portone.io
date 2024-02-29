import type { Environment } from "monaco-editor";

const { default: editorWorker } = await import(
  "monaco-editor/esm/vs/editor/editor.worker?worker"
);
const { default: jsonWorker } = await import(
  "monaco-editor/esm/vs/language/json/json.worker?worker"
);
(
  globalThis as unknown as { MonacoEnvironment: Environment }
).MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") return new jsonWorker();
    return new editorWorker();
  },
};

export {};
