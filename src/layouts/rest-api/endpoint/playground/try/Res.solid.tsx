/* @jsxImportSource solid-js */

import JsonViewer from "../../../editor/JsonViewer.solid";
import { Tabs } from "./Tabs.solid";
import Card from "../Card.solid";
import { Show } from "solid-js";

export interface Res {
  status: number;
  headers: Headers;
  body: any;
}

export interface ResProps {
  res: Res | undefined;
}

export default function ResComponent(props: ResProps) {
  return (
    <Card
      titleClass="bg-slate-1"
      title={`Response Status: ${props.res?.status ?? "N/A"}`}
    >
      <div class="grid flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1 p-4">
        <Show
          when={props.res}
          fallback={<span class="text-slate-4 text-xs font-bold">N/A</span>}
        >
          <Tabs
            tabs={[
              {
                id: "body",
                label: "Body",
                render: () => (
                  <JsonViewer
                    jsonText={JSON.stringify(props.res!.body, null, 2) + "\n"}
                  />
                ),
              },
              {
                id: "header",
                label: "Header",
                render: () => (
                  <JsonViewer jsonText={headersToJson(props.res!.headers)} />
                ),
              },
            ]}
          />
        </Show>
      </div>
    </Card>
  );
}

function headersToJson(headers: Headers): string {
  return JSON.stringify(Object.fromEntries(headers.entries()), null, 2) + "\n";
}
