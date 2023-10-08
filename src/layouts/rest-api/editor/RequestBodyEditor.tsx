import MonacoEditor, {
  type IStandaloneCodeEditor,
  type ITextModel,
  commonEditorConfig,
} from "./MonacoEditor";

export interface RequestBodyEditorProps {
  schema: any;
  operationId?: string | undefined;
  onEditorInit: (editor: IStandaloneCodeEditor) => void;
}
export default function RequestBodyEditor({
  schema,
  operationId,
  onEditorInit,
}: RequestBodyEditorProps) {
  return (
    <MonacoEditor
      init={(monaco, domElement) => {
        const value = getInitialJsonText(schema, operationId);
        const model = getModel(value, `inmemory://inmemory/${operationId}`);
        const editor = monaco.editor.create(domElement, {
          ...commonEditorConfig,
          model,
        });
        onEditorInit(editor);
        return editor;
        function getModel(value: string, uri: string): ITextModel {
          if (models.has(uri)) return models.get(uri)!;
          const model = monaco.editor.createModel(
            value,
            "json",
            monaco.Uri.parse(`inmemory://inmemory/${operationId}`)
          );
          models.set(uri, model);
          return model;
        }
      }}
    />
  );
}

const models = new Map<string, ITextModel>();

function getInitialJsonText(schema: any, operationId?: string) {
  if (!operationId) return "{}\n";
  return "{}\n"; // TODO
}
