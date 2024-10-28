import MonacoEditor, { commonEditorConfig } from "./MonacoEditor";

export interface JsonViewerProps {
  jsonText: string;
}
export default function JsonViewer(props: JsonViewerProps) {
  return (
    <MonacoEditor
      value={props.jsonText}
      init={(monaco, domElement) =>
        monaco.editor.create(domElement, {
          ...commonEditorConfig,
          value: props.jsonText,
          language: "json",
          readOnly: true,
        })
      }
    />
  );
}
