import {
  getBodyParameters,
  type Parameter,
  type Operation,
} from "../schema-utils/operation";
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

function getInitialJsonText(schema: any, operation: Operation): string {
  const params = getBodyParameters(schema, operation);
  if (!params.length) return "{}\n";
  return `{\n${params
    .map((param) => {
      const comment = param.required ? "" : "// ";
      const key = JSON.stringify(param.name);
      const value = JSON.stringify(getDefaultValue(schema, param));
      return `  ${comment}${key}: ${value},\n`;
    })
    .join("")}}\n`;
}

function getDefaultValue(_schema: any, param: Parameter): any {
  const type = param.type || "object";
  if (type === "boolean") return false;
  if (type === "number" || type === "integer") return 0;
  if (type === "string") return "";
  if (type === "object") return {};
  if (type === "array") return [];
  return null;
}
