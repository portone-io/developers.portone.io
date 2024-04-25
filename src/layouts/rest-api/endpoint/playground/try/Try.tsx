import { useSignal } from "@preact/signals";
import { type HarRequest } from "httpsnippet-lite";

import type { Endpoint } from "../../../schema-utils/endpoint";
import {
  isQueryOrBodyOperation,
  type Operation,
} from "../../../schema-utils/operation";
import Err from "./Err";
import Req from "./Req";
import ReqSample from "./ReqSample";
import ResComponent, { type Res } from "./Res";
import ResExample from "./ResExample";
import { Tabs } from "./Tabs";

export interface TryProps {
  apiHost: string;
  schema: unknown;
  endpoint: Endpoint;
  operation: Operation;
}
export default function Try(props: TryProps) {
  const waitingSignal = useSignal(false);
  const waiting = waitingSignal.value;
  const errSignal = useSignal("");
  const err = errSignal.value;
  const resSignal = useSignal<Res | undefined>(undefined);
  const harRequestSignal = useSignal<HarRequest | undefined>(undefined);
  const example =
    props.operation.responses?.["200"]?.content?.["application/json"]?.example;
  const tabIdSignal = useSignal<"request" | "response">("request");
  const isQueryOrBody = isQueryOrBodyOperation(props.operation);
  return (
    <div
      class={`grid grid-rows-[auto_1fr] flex-1 gap-3 ${waiting ? "pointer-events-none opacity-50" : ""}`}
    >
      <Tabs
        tabIdSignal={tabIdSignal}
        tabs={[
          {
            id: "request",
            label: "request",
            render: (key) => (
              <div key={key} class="grid grid-rows-2 h-full gap-3">
                <Req
                  {...props}
                  harRequestSignal={harRequestSignal}
                  execute={(fn) =>
                    void (async () => {
                      try {
                        waitingSignal.value = true;
                        resSignal.value = await fn();
                        errSignal.value = "";
                      } catch (err) {
                        errSignal.value = (err as Error).message;
                      } finally {
                        waitingSignal.value = false;
                        tabIdSignal.value = "response";
                      }
                    })()
                  }
                />
                <ReqSample
                  harRequestSignal={harRequestSignal}
                  isQueryOrBody={isQueryOrBody}
                />
              </div>
            ),
          },
          {
            id: "response",
            label: "response",
            render: (key) => (
              <div key={key} class="grid grid-rows-2 h-full gap-3">
                {err ? (
                  <Err>{err}</Err>
                ) : (
                  <ResComponent resSignal={resSignal} />
                )}
                <ResExample example={example} />
              </div>
            ),
          },
        ]}
      ></Tabs>
    </div>
  );
}
