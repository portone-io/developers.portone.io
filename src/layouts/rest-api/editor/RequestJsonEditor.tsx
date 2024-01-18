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
  openapiSchema: any;
  requestObjectSchema: any;
}
export default function RequestJsonEditor({
  initialValue,
  part,
  operation,
  onEditorInit,
  onChange,
  openapiSchema,
  requestObjectSchema,
}: RequestJsonEditorProps) {
  const { operationId } = operation;
  return (
    <MonacoEditor
      onChange={onChange}
      init={(monaco, domElement) => {
        const uri = `inmemory://operation/${operationId}/${part}`;
        const schemaUri = `inmemory://operation/${operationId}/${part}/schema`;
        const model = getModel(initialValue, uri);
        const { jsonDefaults } = monaco.languages.json;
        registerSchema();
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
        function registerSchema() {
          if (schemas.has(schemaUri)) return;
          schemas.set(schemaUri, {
            uri: schemaUri,
            fileMatch: [uri],
            schema: requestObjectSchema,
          });
          const schemasArray = Array.from(schemas.values());
          schemasArray.push({
            uri: "inmemory://schema",
            schema: openapiSchema,
          });
          diagnosticsOptions.schemas = schemasArray;
          jsonDefaults.setDiagnosticsOptions(diagnosticsOptions);
          console.log(diagnosticsOptions);
        }
      }}
    />
  );
}

const diagnosticsOptions: { validate: boolean; schemas: Schema[] } = {
  validate: true,
  schemas: [],
};

interface Schema {
  uri: string;
  fileMatch?: string[];
  schema: {
    type: "object";
    properties: any[];
  };
}
const schemas = new Map<string, Schema>();
const models = new Map<string, ITextModel>();

export function getReqParams(
  schema: any,
  operation: Operation,
  part: RequestPart,
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
