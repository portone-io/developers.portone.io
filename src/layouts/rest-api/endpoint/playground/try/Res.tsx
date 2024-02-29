import type { Signal } from "@preact/signals";

import JsonViewer from "../../../editor/JsonViewer";
import Card from "../Card";
import { Tabs } from "./Tabs";

export interface Res {
  status: number;
  headers: Headers;
  body: unknown;
}

export interface ResProps {
  resSignal: Signal<Res | undefined>;
}
export default function Res({ resSignal }: ResProps) {
  const res = resSignal.value;
  return (
    <Card
      titleClass="bg-slate-1"
      title={`Response Status: ${res ? res.status : "N/A"}`}
    >
      <div class="grid grid-rows-[auto_minmax(0,1fr)] flex-1 gap-1 p-4">
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
          <span class="text-xs text-slate-4 font-bold">N/A</span>
        )}
      </div>
    </Card>
  );
}

function headersToJson(headers: Headers): string {
  return JSON.stringify(Object.fromEntries(headers.entries()), null, 2) + "\n";
}
