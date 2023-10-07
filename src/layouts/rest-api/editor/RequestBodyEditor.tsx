import MonacoEditor, { commonEditorConfig } from "./MonacoEditor";

export interface RequestBodyEditorProps {
  schema: any;
  operationId?: string | undefined;
}
export default function RequestBodyEditor({
  schema,
  operationId,
}: RequestBodyEditorProps) {
  return (
    <MonacoEditor
      init={(monaco, domElement) => {
        const value = getInitialJsonText(schema, operationId);
        const uri = monaco.Uri.parse(`inmemory://inmemory/${operationId}`);
        const editor = monaco.editor.create(domElement, {
          ...commonEditorConfig,
          model: monaco.editor.createModel(value, "json", uri),
        });
        return editor;
      }}
    />
  );
}

function getInitialJsonText(schema: any, operationId?: string) {
  if (!operationId) return "{}\n";
  return "{}\n"; // TODO
}
