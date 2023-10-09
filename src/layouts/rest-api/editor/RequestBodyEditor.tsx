import type { Operation } from "../schema-utils/operation";
import MonacoEditor, {
  type IStandaloneCodeEditor,
  type ITextModel,
  commonEditorConfig,
} from "./MonacoEditor";

export interface RequestBodyEditorProps {
  schema: any;
  operation: Operation;
  onEditorInit: (editor: IStandaloneCodeEditor) => void;
}
export default function RequestBodyEditor({
  schema,
  operation,
  onEditorInit,
}: RequestBodyEditorProps) {
  const { operationId } = operation;
  return (
    <MonacoEditor
      init={(monaco, domElement) => {
        const value = getInitialJsonText(schema, operation);
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

function getInitialJsonText(schema: any, operation: Operation) {
  return "{}\n"; // TODO
}
