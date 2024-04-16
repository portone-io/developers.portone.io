import {
  type Signal,
  signal,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
import { type HarRequest } from "httpsnippet-lite";
import json5 from "json5";
import { useMemo } from "preact/hooks";
import { encode as encodeQs } from "querystring";

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
import type { Operation, Parameter } from "../../../schema-utils/operation";
import Card from "../Card";
import type { Res } from "./Res";
import { Tabs } from "./Tabs";

export interface ReqProps {
  apiHost: string;
  schema: unknown;
  endpoint: Endpoint;
  operation: Operation;
  harRequestSignal: Signal<HarRequest | undefined>;
  execute: (fn: () => Promise<Res>) => void;
}
export default function Req({
  apiHost,
  schema,
  endpoint,
  operation,
  harRequestSignal,
  execute,
}: ReqProps) {
  const { path, method } = endpoint;
  const reqHeaderSignal = useSignal<KvList>([
    { key: "Content-Type", value: "application/json" },
  ]);
  const reqPathParams = useReqParams(schema, operation, "path");
  const reqQueryParams = useReqParams(schema, operation, "query");
  const reqBodyParams = useReqParams(schema, operation, "body");
  useSignalEffect(() => {
    harRequestSignal.value = createHarRequest(
      apiHost,
      path,
      method,
      reqHeaderSignal,
      reqPathParams,
      reqQueryParams,
      reqBodyParams,
    );
  });
  return (
    <Card
      title={
        <>
          <span>Request</span>
          <button
            class="border border-slate-2 rounded bg-slate-1 px-4 font-bold active:bg-white hover:bg-slate-2"
            onClick={() =>
              execute(async () => {
                const headers = kvListToObject(reqHeaderSignal.value);
                const reqPath = reqPathParams.parseJson();
                const reqQuery = reqQueryParams.parseJson();
                const reqBody = reqBodyParams.parseJson();
                const body =
                  method === "get" || method === "head"
                    ? null
                    : JSON.stringify(reqBody);
                const reqUrl = createUrl(apiHost, path, reqPath, reqQuery);
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
      <div class="grid grid-rows-[auto_minmax(0,1fr)] flex-1 gap-3 p-4">
        <Tabs
          tabs={[
            reqPathParams.params.length && {
              id: "path",
              label: "Path",
              render: (id) => (
                <RequestJsonEditor
                  key={id}
                  part="path"
                  initialValue={reqPathParams.initialJsonText}
                  operation={operation}
                  onChange={reqPathParams.updateJsonText}
                  openapiSchema={schema}
                  requestObjectSchema={reqPathParams.reqSchema}
                />
              ),
            },
            reqQueryParams.params.length && {
              id: "query",
              label: "Query",
              render: (id) => (
                <RequestJsonEditor
                  key={id}
                  part="query"
                  initialValue={reqQueryParams.initialJsonText}
                  operation={operation}
                  onChange={reqQueryParams.updateJsonText}
                  openapiSchema={schema}
                  requestObjectSchema={reqQueryParams.reqSchema}
                />
              ),
            },
            reqBodyParams.params.length && {
              id: "body",
              label: "Body",
              render: (id) => (
                <RequestJsonEditor
                  key={id}
                  part="body"
                  initialValue={reqBodyParams.initialJsonText}
                  operation={operation}
                  onChange={reqBodyParams.updateJsonText}
                  openapiSchema={schema}
                  requestObjectSchema={reqBodyParams.reqSchema}
                />
              ),
            },
            {
              id: "header",
              label: "Header",
              render: (id) => (
                <RequestHeaderEditor
                  key={id}
                  reqHeaderSignal={reqHeaderSignal}
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
  params: Parameter[];
  reqSchema: unknown;
  initialJsonText: string;
  jsonTextSignal: Signal<string>;
  updateJsonText: (value: string) => void;
  parseJson: () => unknown;
}
function useReqParams(
  schema: unknown,
  operation: Operation,
  part: RequestPart,
): ReqParams {
  return useMemo(() => {
    const params = getReqParams(schema, operation, part);
    const reqSchema = {
      type: "object",
      properties: Object.fromEntries(
        params.map(({ $ref, ...param }) => {
          if (!$ref) return [param.name, param];
          return [param.name, { ...param, $ref: `inmemory://schema${$ref}` }];
        }),
      ),
    };
    const initialJsonText = getInitialJsonText(schema, params);
    const jsonTextSignal = signal(initialJsonText);
    const updateJsonText = (value: string) => (jsonTextSignal.value = value);
    const parseJson = () => parseReqJson(jsonTextSignal.value, part);
    return {
      params,
      reqSchema,
      initialJsonText,
      jsonTextSignal,
      updateJsonText,
      parseJson,
    };
  }, []);
}

function createUrl(
  base: string,
  path: string,
  pathObject?: unknown,
  queryObject?: unknown,
): URL {
  const result = new URL(bakePath(path, pathObject), base);
  if (queryObject)
    result.search = `?${encodeQs(queryObject as Parameters<typeof encodeQs>[0])}`;
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
    throw new Error(`${Part}가 올바르지 않습니다.\n${(err as Error).message}`);
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
  reqHeaderSignal: Signal<KvList>,
  reqPathParams: ReqParams,
  reqQueryParams: ReqParams,
  reqBodyParams: ReqParams,
): HarRequest {
  const headers = kvListToObject(reqHeaderSignal.value);
  const reqPath = reqPathParams.parseJson();
  const reqQuery = reqQueryParams.parseJson();
  const reqBody = reqBodyParams.parseJson();
  return {
    url: createUrl(apiHost, path, reqPath, reqQuery).toString(),
    method,
    headers: Object.entries(headers).map(([name, value]) => ({ name, value })),
    cookies: [],
    httpVersion: "HTTP/1.1",
    queryString: Object.entries(reqQuery as Record<string, string>).map(
      ([name, value]) => ({ name, value }),
    ),
    postData: {
      mimeType: "application/json",
      text: JSON.stringify(reqBody),
    },
    bodySize: -1,
    headersSize: -1,
  } satisfies HarRequest;
}
