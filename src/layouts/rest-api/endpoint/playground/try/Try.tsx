import { type HarRequest } from "httpsnippet-lite";
import { createMemo, createSignal, Show } from "solid-js";

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
  const [waiting, setWaiting] = createSignal(false);
  const [err, setErr] = createSignal("");
  const [res, setRes] = createSignal<Res | undefined>(undefined);
  const [harRequest, setHarRequest] = createSignal<HarRequest | undefined>(
    undefined,
  );
  const example = createMemo(
    () =>
      props.operation.responses?.["200"]?.content?.["application/json"]
        ?.example,
  );
  const [tabId, setTabId] = createSignal<"request" | "response">("request");
  const isQueryOrBody = createMemo(() =>
    isQueryOrBodyOperation(props.operation),
  );
  return (
    <div
      class="grid grid-rows-[auto_1fr] flex-1 gap-3"
      classList={{
        "pointer-events-none": waiting(),
        "opacity-50": waiting(),
      }}
    >
      <Tabs
        tabId={tabId()}
        setTabId={setTabId}
        tabs={[
          {
            id: "request",
            label: "request",
            render: () => (
              <div class="grid grid-rows-2 h-full gap-3">
                <Req
                  {...props}
                  harRequest={harRequest()}
                  setHarRequest={setHarRequest}
                  execute={(fn) =>
                    void (async () => {
                      try {
                        setWaiting(true);
                        setRes(await fn());
                        setErr("");
                      } catch (err) {
                        setErr((err as Error).message);
                      } finally {
                        setWaiting(false);
                        setTabId("response");
                      }
                    })()
                  }
                />
                <ReqSample
                  harRequest={harRequest()}
                  isQueryOrBody={isQueryOrBody()}
                />
              </div>
            ),
          },
          {
            id: "response",
            label: "response",
            render: () => (
              <div class="grid grid-rows-2 h-full gap-3">
                <Show when={err()} fallback={<ResComponent res={res()} />}>
                  <Err>{err()}</Err>
                </Show>
                <ResExample example={example()} />
              </div>
            ),
          },
        ]}
      ></Tabs>
    </div>
  );
}
