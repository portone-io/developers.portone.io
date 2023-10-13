import {
  type Operation,
  type Parameter,
  getBodyParameters,
  getPathParameters,
  getQueryParameters,
} from "../schema-utils/operation";
import MonacoEditor, {
  type IStandaloneCodeEditor,
  type ITextModel,
  commonEditorConfig,
} from "./MonacoEditor";

export type RequestPart = "path" | "query" | "body";
export interface RequestJsonEditorProps {
  initialValue: string;
  part: RequestPart;
  operation: Operation;
  onEditorInit?: (editor: IStandaloneCodeEditor) => void;
  onChange?: ((value: string) => void) | undefined;
}
export default function RequestJsonEditor({
  initialValue,
  part,
  operation,
  onEditorInit,
  onChange,
}: RequestJsonEditorProps) {
  const { operationId } = operation;
  return (
    <MonacoEditor
      onChange={onChange}
      init={(monaco, domElement) => {
        const uri = `inmemory://inmemory/${operationId}/${part}`;
        const model = getModel(initialValue, uri);
        const editor = monaco.editor.create(domElement, {
          ...commonEditorConfig,
          model,
        });
        onEditorInit?.(editor);
        return editor;
        function getModel(value: string, uri: string): ITextModel {
          if (models.has(uri)) return models.get(uri)!;
          const uriObject = monaco.Uri.parse(uri);
          const model = monaco.editor.createModel(value, "json", uriObject);
          models.set(uri, model);
          return model;
        }
      }}
    />
  );
}

const models = new Map<string, ITextModel>();

export function getReqParams(
  schema: any,
  operation: Operation,
  part: RequestPart
): Parameter[] {
  return part === "path"
    ? getPathParameters(operation)
    : part === "query"
    ? getQueryParameters(operation)
    : getBodyParameters(schema, operation);
}

export function getInitialJsonText(schema: any, params: Parameter[]): string {
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
