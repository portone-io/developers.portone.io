export default Promise.resolve().then(async () => {
  const { default: editorWorker } = await import(
    "monaco-editor/esm/vs/editor/editor.worker?worker"
  );
  const { default: jsonWorker } = await import(
    "monaco-editor/esm/vs/language/json/json.worker?worker"
  );
  (globalThis as any).MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === "json") return new jsonWorker();
      return new editorWorker();
    },
  };
});
