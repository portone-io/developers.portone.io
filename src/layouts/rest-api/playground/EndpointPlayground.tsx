import { useRef } from "preact/hooks";
import type { IStandaloneCodeEditor } from "../editor/MonacoEditor";
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
  return (
    <div class="top-4rem sticky flex h-[calc(100vh-10rem)] flex-col gap-1">
      <div class="text-sm font-bold uppercase">try</div>
      <div class="grid flex-1 grid-rows-2 gap-1">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col text-xs">
            <div class="flex justify-between">
              <span class="font-bold">Request</span>
              <button
                class="bg-slate-1 rounded px-4 font-bold"
                onClick={async () => {
                  const res = await fetch(new URL(path, apiHost), { method });
                  const json = await res.json();
                  console.log(res.status, res.headers, json);
                }}
              >
                실행
              </button>
            </div>
            <div class="flex gap-1">
              <button class="font-bold">Body</button>
              <button class="">Header</button>
            </div>
          </div>
          <RequestBodyEditor
            schema={schema}
            operation={operation}
            onEditorInit={(editor) => (editorRef.current = editor)}
          />
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex flex-col text-xs">
            <span class="font-bold">
              <span>Response Status: </span>
              <span>N/A</span>
            </span>
            <div class="flex gap-1">
              <button class="font-bold">Body</button>
              <button class="">Header</button>
            </div>
          </div>
          <span class="text-slate-4 text-xs font-bold">N/A</span>
        </div>
      </div>
    </div>
  );
}
