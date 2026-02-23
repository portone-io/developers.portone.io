import { type HarRequest } from "httpsnippet-lite";
import json5 from "json5";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";

import RequestHeaderEditor, {
  type KvList,
  kvListToObject,
} from "../../../editor/RequestHeaderEditor";
import RequestJsonEditor, {
  getInitialJsonText,
  getReqParams,
  type RequestPart,
} from "../../../editor/RequestJsonEditor";
import type { Endpoint } from "../../../schema-utils/endpoint";
import {
  isQueryOrBodyOperation,
  type Operation,
  type Parameter,
} from "../../../schema-utils/operation";
import Card from "../Card";
import type { Res } from "./Res";
import { Tabs } from "./Tabs";

export interface ReqProps {
  apiHost: string;
  schema: unknown;
  endpoint: Endpoint;
  operation: Operation;
  harRequest: HarRequest | undefined;
  setHarRequest: (request: HarRequest | undefined) => void;
  execute: (fn: () => Promise<Res>) => void;
}
export default function Req(props: ReqProps) {
  const [reqHeader, setReqHeader] = createSignal<KvList>([
    {
      key: createSignal("Content-Type"),
      value: createSignal("application/json"),
    },
  ]);
  const isQueryOrBody = createMemo(() =>
    isQueryOrBodyOperation(props.operation),
  );
  const reqPathParams = createMemo(() =>
    makeReqParams(props.schema, props.operation, "path"),
  );
  const reqQueryParams = createMemo(() =>
    makeReqParams(props.schema, props.operation, "query", isQueryOrBody()),
  );
  const reqBodyParams = createMemo(() =>
    makeReqParams(props.schema, props.operation, "body"),
  );

  const harRequest = createHarRequest(
    props.apiHost,
    props.endpoint.path,
    props.endpoint.method,
    reqHeader,
    reqPathParams,
    reqQueryParams,
    reqBodyParams,
  );

  createEffect(() => {
    const newRequest = harRequest();
    if (newRequest) props.setHarRequest(newRequest);
  });

  const pathTab = {
    id: "path",
    label: "Path",
    render: () => (
      <RequestJsonEditor
        part="path"
        initialValue={reqPathParams().initialJsonText}
        operation={props.operation}
        onChange={reqPathParams().updateJsonText}
        openapiSchema={props.schema}
        requestObjectSchema={reqPathParams().reqSchema}
      />
    ),
  };
  const queryTab = {
    id: "query",
    label: "Query",
    render: () => (
      <RequestJsonEditor
        part="query"
        initialValue={reqQueryParams().initialJsonText}
        operation={props.operation}
        onChange={reqQueryParams().updateJsonText}
        openapiSchema={props.schema}
        requestObjectSchema={reqQueryParams().reqSchema}
      />
    ),
  };
  const bodyTab = {
    id: "body",
    label: "Body",
    render: () => (
      <RequestJsonEditor
        part="body"
        initialValue={reqBodyParams().initialJsonText}
        operation={props.operation}
        onChange={reqBodyParams().updateJsonText}
        openapiSchema={props.schema}
        requestObjectSchema={reqBodyParams().reqSchema}
      />
    ),
  };
  const headerTab = {
    id: "header",
    label: "Header",
    render: () => (
      <RequestHeaderEditor reqHeader={reqHeader()} onChange={setReqHeader} />
    ),
  };

  return (
    <Card
      title={
        <>
          <span>Request</span>
          <button
            class="border border-slate-2 rounded bg-slate-1 px-4 font-bold active:bg-white hover:bg-slate-2"
            onClick={() =>
              props.execute(async () => {
                const headers = kvListToObject(reqHeader());
                const reqPath = reqPathParams().parseJson();
                const reqBody = reqBodyParams().parseJson();
                const reqQuery = isQueryOrBody()
                  ? {
                      ...(reqQueryParams().parseJson() ?? {}),
                      requestBody: reqBody,
                    }
                  : reqQueryParams().parseJson();

                const body =
                  props.endpoint.method === "get" ||
                  props.endpoint.method === "head" ||
                  isQueryOrBody()
                    ? null
                    : JSON.stringify(reqBody);
                const reqUrl = createUrl(
                  props.apiHost,
                  props.endpoint.path,
                  reqPath,
                  reqQuery,
                );
                const res = await fetch(reqUrl, {
                  method: props.endpoint.method.toUpperCase(),
                  headers,
                  body,
                });
                return await responseToRes(res);
              })
            }
          >
            실행
          </button>
        </>
      }
    >
      <div class="grid grid-rows-[auto_minmax(0,1fr)] flex-1 gap-3 p-4">
        <Tabs
          tabs={[
            reqPathParams().params.length && pathTab,
            reqQueryParams().params.length && queryTab,
            reqBodyParams().params.length && bodyTab,
            headerTab,
          ].filter(Boolean)}
        />
      </div>
    </Card>
  );
}

interface ReqParams {
  params: Parameter[];
  reqSchema: ReqSchema;
  initialJsonText: string;
  jsonText: Accessor<string>;
  updateJsonText: (value: string) => void;
  parseJson: () => unknown;
}
interface ReqSchema {
  type: "object";
  properties: Record<string, Parameter>;
}
function makeReqParams(
  schema: unknown,
  operation: Operation,
  part: RequestPart,
  isQueryOrBody: boolean = false,
): ReqParams {
  const params = getReqParams(schema, operation, part, isQueryOrBody);
  const reqSchema: ReqSchema = {
    type: "object",
    properties: Object.fromEntries(
      params.map(({ $ref, ...param }) => {
        if (!$ref) return [param.name, param];
        return [param.name, { ...param, $ref: `inmemory://schema${$ref}` }];
      }),
    ),
  };
  const initialJsonText = getInitialJsonText(schema, params);
  const [jsonText, updateJsonText] = createSignal(initialJsonText);
  const parseJson = () => parseReqJson(jsonText(), part);
  return {
    params,
    reqSchema,
    initialJsonText,
    jsonText,
    updateJsonText,
    parseJson,
  };
}

function createUrl(
  base: string,
  path: string,
  pathObject?: unknown,
  queryObject?: unknown,
): URL {
  const result = new URL(bakePath(path, pathObject), base);
  if (queryObject) {
    for (const [key, value] of Object.entries(queryObject)) {
      if (value === undefined) continue;
      result.searchParams.append(
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      );
    }
  }
  return result;
}

function bakePath(path: string, pathObject?: unknown): string {
  if (!pathObject) return path;
  return path.replaceAll(/\{(.+?)\}/g, (_, key) =>
    encodeURIComponent(
      (pathObject as Record<string, string>)[key as string] ?? "",
    ),
  );
}

function parseReqJson(json: string, part: RequestPart): unknown {
  try {
    return json5.parse(json);
  } catch (err) {
    const Part = part[0]?.toUpperCase() + part.slice(1);
    throw new Error(`${Part}가 올바르지 않습니다.`, { cause: err });
  }
}

async function responseToRes(res: Response): Promise<Res> {
  const { status, headers } = res;
  const body = (await res.json()) as unknown;
  return { status, headers, body };
}

function createHarRequest(
  apiHost: string,
  path: string,
  method: string,
  reqHeader: Accessor<KvList>,
  reqPathParams: Accessor<ReqParams>,
  reqQueryParams: Accessor<ReqParams>,
  reqBodyParams: Accessor<ReqParams>,
): Accessor<HarRequest | null> {
  const nullOnCatch = <T,>(fn: () => T): T | null => {
    try {
      return fn();
    } catch {
      return null;
    }
  };

  const headers = createMemo(() => kvListToObject(reqHeader()));
  const reqPath = createMemo(() =>
    nullOnCatch(() => reqPathParams().parseJson()),
  );
  const reqQuery = createMemo(() =>
    nullOnCatch(() => reqQueryParams().parseJson()),
  );
  const reqBody = createMemo(() =>
    nullOnCatch(() => reqBodyParams().parseJson()),
  );

  return createMemo(() => {
    const pathValue = reqPath();
    const queryValue = reqQuery();
    const bodyValue = reqBody();
    if (!pathValue || !queryValue || !bodyValue) return null;

    return {
      url: createUrl(apiHost, path, pathValue, queryValue).toString(),
      method: method.toUpperCase(),
      headers: Object.entries(headers()).map(([name, value]) => ({
        name,
        value,
      })),
      cookies: [],
      httpVersion: "HTTP/1.1",
      queryString: Object.entries(queryValue as Record<string, string>).map(
        ([name, value]) => ({ name, value }),
      ),
      postData: {
        mimeType: "application/json",
        text: JSON.stringify(bodyValue),
      },
      bodySize: -1,
      headersSize: -1,
    } satisfies HarRequest;
  });
}
