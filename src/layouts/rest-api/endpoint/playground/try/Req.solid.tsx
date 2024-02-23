/* @jsxImportSource solid-js */

import { encode as encodeQs } from "querystring";
import { createSignal, type Accessor, createMemo } from "solid-js";
import json5 from "json5";
import { schema } from "~/state/rest-api/schema";
import type {
  OpenApiSchema,
  Operation,
  Parameter,
} from "../../../schema-utils";
import type { Endpoint } from "../../../schema-utils/endpoint";
import RequestJsonEditor, {
  type RequestPart,
  getInitialJsonText,
  getReqParams,
} from "../../../editor/RequestJsonEditor.solid";
import RequestHeaderEditor, {
  kvListToObject,
  type KvList,
} from "../../../editor/RequestHeaderEditor.solid";
import type { Res } from "./Res.solid";
import { Tabs } from "./Tabs.solid";
import Card from "../Card.solid";

export interface ReqProps {
  apiHost: string;
  endpoint: Endpoint;
  operation: Operation;
  execute: (fn: () => Promise<Res>) => void;
}
export default function Req(props: ReqProps) {
  const [reqHeaders, setReqHeaders] = createSignal<KvList>([
    { key: "Content-Type", value: "application/json" },
  ]);
  const reqPathParams = useReqParams(schema, () => props.operation, "path");
  const reqQueryParams = useReqParams(schema, () => props.operation, "query");
  const reqBodyParams = useReqParams(schema, () => props.operation, "body");

  const pathTab = {
    id: "path",
    label: "Path",
    render: () => (
      <RequestJsonEditor
        part="path"
        initialValue={reqPathParams.initialJsonText}
        operation={props.operation}
        onChange={reqPathParams.setJsonText}
        requestObjectSchema={reqPathParams.reqSchema()}
      />
    ),
  };
  const queryTab = {
    id: "query",
    label: "Query",
    render: () => (
      <RequestJsonEditor
        part="query"
        initialValue={reqQueryParams.initialJsonText}
        operation={props.operation}
        onChange={reqQueryParams.setJsonText}
        requestObjectSchema={reqQueryParams.reqSchema()}
      />
    ),
  };
  const bodyTab = {
    id: "body",
    label: "Body",
    render: () => (
      <RequestJsonEditor
        part="body"
        initialValue={reqBodyParams.initialJsonText}
        operation={props.operation}
        onChange={reqBodyParams.setJsonText}
        requestObjectSchema={reqBodyParams.reqSchema()}
      />
    ),
  };

  return (
    <Card
      title={
        <>
          <span>Request</span>
          <button
            type="button"
            class="border-slate-2 hover:bg-slate-2 bg-slate-1 rounded border px-4 font-bold active:bg-white"
            onClick={() =>
              props.execute(async () => {
                const method = props.endpoint.method;
                const headers = kvListToObject(reqHeaders());
                const reqPath = reqPathParams.parseJson();
                const reqQuery = reqQueryParams.parseJson();
                const reqBody = reqBodyParams.parseJson();
                const body =
                  method === "get" || method === "head"
                    ? null
                    : JSON.stringify(reqBody);
                const reqUrl = createUrl(
                  props.apiHost,
                  props.endpoint.path,
                  reqPath,
                  reqQuery,
                );
                const res = await fetch(reqUrl, { method, headers, body });
                return await responseToRes(res);
              })
            }
          >
            실행
          </button>
        </>
      }
    >
      <div class="grid flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 p-4">
        <Tabs
          tabs={[
            reqPathParams.params().length && pathTab,
            reqQueryParams.params().length && queryTab,
            reqBodyParams.params().length && bodyTab,
            {
              id: "header",
              label: "Header",
              render: () => (
                <RequestHeaderEditor
                  reqHeaders={reqHeaders()}
                  setReqHeaders={setReqHeaders}
                />
              ),
            },
          ]}
        />
      </div>
    </Card>
  );
}

interface ReqParams {
  params: Accessor<Parameter[]>;
  reqSchema: Accessor<{ type: "object"; properties: any[] }>;
  initialJsonText: string;
  jsonText: Accessor<string>;
  setJsonText: (value: string) => void;
  parseJson: () => any;
}
function useReqParams(
  schema: Accessor<OpenApiSchema>,
  operation: Accessor<Operation>,
  part: RequestPart,
): ReqParams {
  const params = createMemo(() => getReqParams(schema(), operation(), part));
  const reqSchema = createMemo(
    () =>
      ({
        type: "object",
        properties: Object.fromEntries(
          params().map(({ $ref, ...param }) => {
            if (!$ref) return [param.name, param];
            return [param.name, { ...param, $ref: `inmemory://schema${$ref}` }];
          }),
        ),
      }) as any,
  );
  const initialJsonText = getInitialJsonText(schema(), params());
  const [jsonText, setJsonText] = createSignal(initialJsonText);
  const parseJson = () => parseReqJson(jsonText(), part);

  return {
    params,
    reqSchema,
    initialJsonText,
    jsonText,
    setJsonText,
    parseJson,
  };
}

function createUrl(
  base: string,
  path: string,
  pathObject?: any,
  queryObject?: any,
): URL {
  const result = new URL(bakePath(path, pathObject), base);
  if (queryObject) result.search = `?${encodeQs(queryObject)}`;
  return result;
}

function bakePath(path: string, pathObject?: any): string {
  if (!pathObject) return path;
  return path.replaceAll(/\{(.+?)\}/g, (_, key) =>
    encodeURIComponent(pathObject[key]),
  );
}

function parseReqJson(json: string, part: RequestPart): any {
  try {
    return json5.parse(json);
  } catch (err) {
    const Part = part[0]?.toUpperCase() + part.slice(1);
    throw new Error(`${Part}가 올바르지 않습니다.\n${(err as Error).message}`);
  }
}

async function responseToRes(res: Response): Promise<Res> {
  const { status, headers } = res;
  const body = await res.json();
  return { status, headers, body };
}
