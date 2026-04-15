import { createMemo, Show } from "solid-js";

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
  const title = createMemo(
    () => `Response Status: ${props.res?.status ?? "N/A"}`,
  );

  return (
    <Card titleClass="bg-slate-1" title={title()}>
      <div class="grid flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1 p-4">
        <Show
          when={props.res}
          fallback={<span class="text-xs font-bold text-slate-4">N/A</span>}
        >
          {(res) => {
            const bodyJsonText = createMemo(
              () => JSON.stringify(res().body, null, 2) + "\n",
            );
            const headerJsonText = createMemo(() =>
              headersToJson(res().headers),
            );

            return (
              <Tabs
                tabs={[
                  {
                    id: "body",
                    label: "Body",
                    render: () => <JsonViewer jsonText={bodyJsonText()} />,
                  },
                  {
                    id: "header",
                    label: "Header",
                    render: () => <JsonViewer jsonText={headerJsonText()} />,
                  },
                ]}
              />
            );
          }}
        </Show>
      </div>
    </Card>
  );
}

function headersToJson(headers: Headers): string {
  return JSON.stringify(Object.fromEntries(headers.entries()), null, 2) + "\n";
}
