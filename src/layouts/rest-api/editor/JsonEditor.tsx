import { useEffect, useRef } from "preact/hooks";

export default function JsonEditor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    import("monaco-editor").then((monaco) => {
      monaco.editor.create(ref.current!, {
        value: "{}\n",
        language: "json",
        automaticLayout: true,
        lineNumbersMinChars: 3,
        folding: false,
        tabSize: 2,
      });
    });
  }, []);
  return (
    <div class="relative flex-1">
      <div ref={ref} class="absolute h-full w-full" />
    </div>
  );
}
