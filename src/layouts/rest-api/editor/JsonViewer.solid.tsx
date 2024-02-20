/* @jsxImportSource solid-js */

import MonacoEditor, { commonEditorConfig } from "./MonacoEditor.solid";

export interface JsonViewerProps {
  jsonText: string;
}
export default function JsonViewer({ jsonText }: JsonViewerProps) {
  return (
    <MonacoEditor
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
