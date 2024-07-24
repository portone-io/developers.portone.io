import type { Environment } from "monaco-editor";

export async function installWorkers() {
  const [{ default: editorWorker }, { default: jsonWorker }] =
    await Promise.all([
      import("monaco-editor/esm/vs/editor/editor.worker?worker"),
      import("monaco-editor/esm/vs/language/json/json.worker?worker"),
    ]);
  (
    globalThis as unknown as { MonacoEnvironment: Environment }
  ).MonacoEnvironment = {
    getWorker(_, label) {
      if (label === "json") return new jsonWorker();
      return new editorWorker();
    },
  };
}
