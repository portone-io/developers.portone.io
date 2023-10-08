import { useRef } from "preact/hooks";
import type { IStandaloneCodeEditor } from "../editor/MonacoEditor";
import RequestBodyEditor from "../editor/RequestBodyEditor";
import type { Endpoint } from "../schema-utils/endpoint";

export interface EndpointPlaygroundProps {
  apiHost: string;
  schema: any;
  endpoint: Endpoint;
  operationId?: string | undefined;
}
export default function EndpointPlayground({
  apiHost,
  schema,
  endpoint: { path, method },
  operationId,
}: EndpointPlaygroundProps) {
  const editorRef = useRef<IStandaloneCodeEditor>();
  return (
    <>
      <div class="flex justify-between">
        <div class="text-sm font-bold uppercase">try</div>
        <button
          class="bg-slate-1 rounded-sm px-4 text-sm font-bold"
          onClick={async () => {
            const res = await fetch(new URL(path, apiHost), { method });
            const json = await res.json();
            console.log(res.status, res.headers, json);
          }}
        >
          실행
        </button>
      </div>
      <div class="grid flex-1 grid-rows-2 gap-1">
        <div class="flex flex-col gap-2">
          <div class="flex gap-1 text-xs">
            <span class="font-bold">Request</span>
            <button class="font-bold">Body</button>
            <button class="">Header</button>
          </div>
          <RequestBodyEditor
            schema={schema}
            operationId={operationId}
            onEditorInit={(editor) => (editorRef.current = editor)}
          />
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex gap-1 text-xs">
            <span class="font-bold">Response</span>
            <button class="font-bold">Body</button>
            <button class="">Header,</button>
            <span>status: </span>
            <span class="font-bold">200</span>
          </div>
          <span class="text-slate-4 text-xs font-bold">N/A</span>
        </div>
      </div>
    </>
  );
}
