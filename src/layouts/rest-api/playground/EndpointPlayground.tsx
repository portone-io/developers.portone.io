import { encode as encodeQs } from "querystring";
import json5 from "json5";
import { type Signal, useSignal } from "@preact/signals";
import JsonViewer from "../editor/JsonViewer";
import RequestJsonEditor, { getReqParams } from "../editor/RequestJsonEditor";
import type { Endpoint } from "../schema-utils/endpoint";
import type { Operation } from "../schema-utils/operation";

export interface EndpointPlaygroundProps {
  apiHost: string;
  schema: any;
  endpoint: Endpoint;
  operation: Operation;
}
export default function EndpointPlayground({
  apiHost,
  schema,
  endpoint,
  operation,
}: EndpointPlaygroundProps) {
  const { path, method } = endpoint;
  const errSignal = useSignal("");
  const err = errSignal.value;
  const resSignal = useSignal<Res | undefined>(undefined);
  const reqPathJsonSignal = useSignal("{}");
  const reqQueryJsonSignal = useSignal("{}");
  const reqBodyJsonSignal = useSignal("{}");
  const reqPathParams = getReqParams(schema, operation, "path");
  const reqQueryParams = getReqParams(schema, operation, "query");
  const reqBodyParams = getReqParams(schema, operation, "body");
  return (
    <div class="top-4rem sticky flex h-[calc(100vh-10rem)] flex-col gap-1">
      <div class="text-sm font-bold uppercase">try</div>
      <div class="grid flex-1 grid-rows-2 gap-2">
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-xs">
            <span class="font-bold">Request</span>
            <button
              class="bg-slate-1 rounded px-4 font-bold"
              onClick={async () => {
                try {
                  errSignal.value = "";
                  const reqPathJson = reqPathJsonSignal.value;
                  const reqQueryJson = reqQueryJsonSignal.value;
                  const reqBodyJson = reqBodyJsonSignal.value;
                  const reqPath = parseReqJson(reqPathJson, "Path");
                  const reqQuery = parseReqJson(reqQueryJson, "Query");
                  const reqBody = parseReqJson(reqBodyJson, "Body");
                  const body =
                    method === "get" || method === "head"
                      ? null
                      : JSON.stringify(reqBody);
                  const reqUrl = createUrl(apiHost, path, reqPath, reqQuery);
                  const res = await fetch(reqUrl, { method, body });
                  resSignal.value = await responseToRes(res);
                } catch (err) {
                  errSignal.value = (err as Error).message;
                }
              }}
            >
              실행
            </button>
          </div>
          <Tabs
            tabs={[
              reqPathParams.length && {
                id: "path",
                label: "Path",
                render: (id) => (
                  <RequestJsonEditor
                    key={id}
                    part="path"
                    params={reqPathParams}
                    schema={schema}
                    operation={operation}
                    onChange={(value) => (reqPathJsonSignal.value = value)}
                  />
                ),
              },
              reqQueryParams.length && {
                id: "query",
                label: "Query",
                render: (id) => (
                  <RequestJsonEditor
                    key={id}
                    part="query"
                    params={reqQueryParams}
                    schema={schema}
                    operation={operation}
                    onChange={(value) => (reqQueryJsonSignal.value = value)}
                  />
                ),
              },
              reqBodyParams.length && {
                id: "body",
                label: "Body",
                render: (id) => (
                  <RequestJsonEditor
                    key={id}
                    part="body"
                    params={reqBodyParams}
                    schema={schema}
                    operation={operation}
                    onChange={(value) => (reqBodyJsonSignal.value = value)}
                  />
                ),
              },
              {
                id: "header",
                label: "Header",
                render() {
                  return null;
                },
              },
            ]}
          />
        </div>
        {err ? <Err>{err}</Err> : <Res resSignal={resSignal} />}
      </div>
    </div>
  );
}

function createUrl(
  base: string,
  path: string,
  pathObject?: any,
  queryObject?: any
): URL {
  const result = new URL(bakePath(path, pathObject), base);
  if (queryObject) result.search = `?${encodeQs(queryObject)}`;
  return result;
}

function bakePath(path: string, pathObject?: any): string {
  if (!pathObject) return path;
  return path.replaceAll(/\{(.+?)\}/g, (_, key) =>
    encodeURIComponent(pathObject[key])
  );
}

function parseReqJson(json: string, part: "Path" | "Query" | "Body"): any {
  try {
    return json5.parse(json);
  } catch (err) {
    throw new Error(`${part}가 올바르지 않습니다.\n${(err as Error).message}`);
  }
}

interface ErrProps {
  children: any;
}
function Err({ children }: ErrProps) {
  return (
    <div class="flex flex-col gap-1">
      <span class="text-xs font-bold">Error</span>
      <div class="text-red-6 whitespace-pre-wrap text-sm">{children}</div>
    </div>
  );
}

interface Res {
  status: number;
  headers: Headers;
  body: any;
}
async function responseToRes(res: Response): Promise<Res> {
  const { status, headers } = res;
  const body = await res.json();
  return { status, headers, body };
}

function headersToJson(headers: Headers): string {
  return JSON.stringify(Object.fromEntries(headers.entries()), null, 2) + "\n";
}

interface ResProps {
  resSignal: Signal<Res | undefined>;
}
function Res({ resSignal }: ResProps) {
  const res = resSignal.value;
  return (
    <div class="flex flex-col gap-1">
      <span class="text-xs font-bold">
        <span>Response Status: </span>
        <span>{res ? res.status : "N/A"}</span>
      </span>
      {res ? (
        <Tabs
          tabs={[
            {
              id: "body",
              label: "Body",
              render: () => (
                <JsonViewer
                  jsonText={JSON.stringify(res.body, null, 2) + "\n"}
                />
              ),
            },
            {
              id: "header",
              label: "Header",
              render: () => (
                <JsonViewer jsonText={headersToJson(res.headers)} />
              ),
            },
          ]}
        />
      ) : (
        <span class="text-slate-4 text-xs font-bold">N/A</span>
      )}
    </div>
  );
}

interface Tab<Id extends string> {
  id: Id;
  label: any;
  render: (id: Id) => any;
}
interface TabsProps<Id extends string> {
  tabs: (Tab<Id> | false | 0)[];
}
function Tabs<Id extends string>({ tabs }: TabsProps<Id>) {
  const _tabs = tabs.filter(Boolean) as Tab<Id>[];
  const currTabIdSignal = useSignal(_tabs[0]?.id || "");
  const currTabId = currTabIdSignal.value;
  const currTab = _tabs.find((tab) => tab.id === currTabId);
  return (
    <>
      <div class="flex gap-1 text-xs">
        {_tabs.map((tab) => {
          const active = currTabId === tab.id;
          const className = active ? "font-bold" : "";
          return (
            <button
              key={tab.id}
              class={className}
              onClick={() => (currTabIdSignal.value = tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div class="flex flex-1 flex-col">
        {currTab && currTab.render(currTab.id)}
      </div>
    </>
  );
}
