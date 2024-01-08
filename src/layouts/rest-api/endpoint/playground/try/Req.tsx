import { encode as encodeQs } from "querystring";
import json5 from "json5";
import { type Signal, useSignal, signal } from "@preact/signals";
import type { Endpoint } from "../../../schema-utils/endpoint";
import type { Operation, Parameter } from "../../../schema-utils/operation";
import RequestJsonEditor, {
  type RequestPart,
  getInitialJsonText,
  getReqParams,
} from "../../../editor/RequestJsonEditor";
import RequestHeaderEditor, {
  kvListToObject,
  type KvList,
} from "../../../editor/RequestHeaderEditor";
import { useMemo } from "preact/hooks";
import type { Res } from "./Res";
import { Tabs } from "./Tabs";
import Card from "../Card";

export interface ReqProps {
  apiHost: string;
  schema: any;
  endpoint: Endpoint;
  operation: Operation;
  execute: (fn: () => Promise<Res>) => void;
}
export default function Req({
  apiHost,
  schema,
  endpoint,
  operation,
  execute,
}: ReqProps) {
  const { path, method } = endpoint;
  const reqHeaderSignal = useSignal<KvList>([
    { key: "Content-Type", value: "application/json" },
  ]);
  const reqPathParams = useReqParams(schema, operation, "path");
  const reqQueryParams = useReqParams(schema, operation, "query");
  const reqBodyParams = useReqParams(schema, operation, "body");
  return (
    <Card
      title={
        <>
          <span>Request</span>
          <button
            class="border-slate-2 hover:bg-slate-2 bg-slate-1 rounded border px-4 font-bold active:bg-white"
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
      <div class="grid flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 p-4">
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
  initialJsonText: string;
  jsonTextSignal: Signal<string>;
  updateJsonText: (value: string) => void;
  parseJson: () => any;
}
function useReqParams(
  schema: any,
  operation: Operation,
  part: RequestPart,
): ReqParams {
  return useMemo(() => {
    const params = getReqParams(schema, operation, part);
    const initialJsonText = getInitialJsonText(schema, params);
    const jsonTextSignal = signal(initialJsonText);
    const updateJsonText = (value: string) => (jsonTextSignal.value = value);
    const parseJson = () => parseReqJson(jsonTextSignal.value, part);
    return {
      params,
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
