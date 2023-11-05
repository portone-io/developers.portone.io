import type { Signal } from "@preact/signals";
import JsonViewer from "../../../editor/JsonViewer";
import { Tabs } from "./Tabs";

export interface Res {
  status: number;
  headers: Headers;
  body: any;
}

export interface ResProps {
  resSignal: Signal<Res | undefined>;
}
export default function Res({ resSignal }: ResProps) {
  const res = resSignal.value;
  return (
    <div class="grid grid-rows-[auto_auto_minmax(0,1fr)] gap-1">
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
        <>
          <span class="text-slate-4 text-xs font-bold">N/A</span>
          <div class="bg-slate-1 rounded opacity-50" />
        </>
      )}
    </div>
  );
}

function headersToJson(headers: Headers): string {
  return JSON.stringify(Object.fromEntries(headers.entries()), null, 2) + "\n";
}
