import type * as monaco from "monaco-editor";

import {
  getBodyParameters,
  getPathParameters,
  getQueryParameters,
  type Operation,
  type Parameter,
} from "../schema-utils/operation";
import MonacoEditor, {
  commonEditorConfig,
  type IStandaloneCodeEditor,
  type ITextModel,
} from "./MonacoEditor";

export type RequestPart = "path" | "query" | "body";
export interface RequestJsonEditorProps {
  initialValue: string;
  part: RequestPart;
  operation: Operation;
  onEditorInit?: (editor: IStandaloneCodeEditor) => void;
  onChange?: ((value: string) => void) | undefined;
  openapiSchema: unknown;
  requestObjectSchema: unknown;
}
export default function RequestJsonEditor(props: RequestJsonEditorProps) {
  return (
    <MonacoEditor
      onChange={props.onChange}
      init={(monaco, domElement) => {
        const uri = `inmemory://operation/${props.operation.operationId}/${props.part}`;
        const schemaUri = `inmemory://operation/${props.operation.operationId}/${props.part}/schema`;
        const model = getModel(props.initialValue, uri);
        const { jsonDefaults } = monaco.languages.json;
        registerSchema();
        const editor = monaco.editor.create(domElement, {
          ...commonEditorConfig,
          model,
        });
        props.onEditorInit?.(editor);
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
            schema: props.requestObjectSchema,
          });
          const schemasArray = Array.from(schemas.values());
          schemasArray.push({
            uri: "inmemory://schema",
            schema: props.openapiSchema,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
          (diagnosticsOptions as any).schemas = schemasArray;
          jsonDefaults.setDiagnosticsOptions(diagnosticsOptions);
        }
      }}
    />
  );
}

const diagnosticsOptions: monaco.languages.json.DiagnosticsOptions = {
  validate: true,
  allowComments: true,
  trailingCommas: "ignore",
  comments: "ignore",
  schemas: [],
};

interface Schema {
  uri: string;
  fileMatch?: string[];
  schema: unknown;
}
const schemas = new Map<string, Schema>();
const models = new Map<string, ITextModel>();

export function getReqParams(
  schema: unknown,
  operation: Operation,
  part: RequestPart,
  isQueryOrBody: boolean,
): Parameter[] {
  return part === "path"
    ? getPathParameters(operation)
    : part === "query"
      ? getQueryParameters(operation, isQueryOrBody)
      : getBodyParameters(schema, operation);
}

export function getInitialJsonText(
  schema: unknown,
  params: Parameter[],
): string {
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

function getDefaultValue(_schema: unknown, param: Parameter): unknown {
  if (param.example) return param.example;
  const type = param.type ? param.type : param.schema?.type || "object";
  if (type === "boolean") return false;
  if (type === "number" || type === "integer") return 0;
  if (type === "string") return param.name;
  if (type === "object") return {};
  if (type === "array") return [];
  return null;
}
