import { useRef } from "preact/hooks";
import { type Signal, useSignal } from "@preact/signals";
import json5 from "json5";
import type { IStandaloneCodeEditor } from "../editor/MonacoEditor";
import JsonViewer from "../editor/JsonViewer";
import RequestBodyEditor from "../editor/RequestBodyEditor";
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
  const editorRef = useRef<IStandaloneCodeEditor>();
  const { path, method } = endpoint;
  const errSignal = useSignal("");
  const err = errSignal.value;
  const resSignal = useSignal<Res | undefined>(undefined);
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
                  const reqUrl = new URL(path, apiHost);
                  const body = getReqBody(editorRef.current);
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
              {
                id: "body",
                label: "Body",
                render() {
                  return (
                    <RequestBodyEditor
                      schema={schema}
                      operation={operation}
                      onEditorInit={(editor) => (editorRef.current = editor)}
                    />
                  );
                },
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

function getReqBody(editor?: IStandaloneCodeEditor): string {
  const editorValue = editor?.getValue() || "";
  try {
    return JSON.stringify(json5.parse(editorValue));
  } catch (err) {
    throw new Error("Body가 올바르지 않습니다.\n" + (err as Error).message);
  }
}

interface ErrProps {
  children: any;
}
function Err({ children }: ErrProps) {
  return (
    <div class="flex flex-col gap-1">
      <span class="text-xs font-bold">Error</span>
      <div class="text-red-6 whitespace-pre text-sm">{children}</div>
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

interface Tab {
  id: string;
  label: any;
  render: () => any;
}
interface TabsProps {
  tabs: Tab[];
}
function Tabs({ tabs }: TabsProps) {
  const currTabIdSignal = useSignal(tabs[0]?.id || "");
  const currTabId = currTabIdSignal.value;
  const currTab = tabs.find((tab) => tab.id === currTabId);
  return (
    <>
      <div class="flex gap-1 text-xs">
        {tabs.map((tab) => {
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
      <div class="flex flex-1 flex-col">{currTab && currTab.render()}</div>
    </>
  );
}
