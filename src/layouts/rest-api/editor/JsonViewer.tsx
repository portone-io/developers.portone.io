import MonacoEditor, { commonEditorConfig } from "./MonacoEditor";

export interface JsonViewerProps {
  jsonText: string;
}
export default function JsonViewer({ jsonText }: JsonViewerProps) {
  return (
    <MonacoEditor
      key={jsonText}
      init={(monaco, domElement) =>
        monaco.editor.create(domElement, {
          ...commonEditorConfig,
          value: jsonText,
          language: "json",
          readOnly: true,
        })
      }
    />
  );
}
