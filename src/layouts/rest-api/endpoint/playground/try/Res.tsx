import { Show } from "solid-js";

import JsonViewer from "../../../editor/JsonViewer";
import Card from "../Card";
import { Tabs } from "./Tabs";

export interface Res {
  status: number;
  headers: Headers;
  body: unknown;
}

export interface ResProps {
  res: Res | undefined;
}
export default function Res(props: ResProps) {
  return (
    <Card
      titleClass="bg-slate-1"
      title={`Response Status: ${props.res ? props.res.status : "N/A"}`}
    >
      <div class="grid grid-rows-[auto_minmax(0,1fr)] flex-1 gap-1 p-4">
        <Show
          when={props.res}
          fallback={<span class="text-xs text-slate-4 font-bold">N/A</span>}
        >
          {(res) => (
            <Tabs
              tabs={[
                {
                  id: "body",
                  label: "Body",
                  render: () => (
                    <JsonViewer
                      jsonText={JSON.stringify(res().body, null, 2) + "\n"}
                    />
                  ),
                },
                {
                  id: "header",
                  label: "Header",
                  render: () => (
                    <JsonViewer jsonText={headersToJson(res().headers)} />
                  ),
                },
              ]}
            />
          )}
        </Show>
      </div>
    </Card>
  );
}

function headersToJson(headers: Headers): string {
  return JSON.stringify(Object.fromEntries(headers.entries()), null, 2) + "\n";
}
