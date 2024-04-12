import { useSignal } from "@preact/signals";
import { type HarRequest } from "httpsnippet-lite";

import type { Endpoint } from "../../../schema-utils/endpoint";
import type { Operation } from "../../../schema-utils/operation";
import Err from "./Err";
import Req from "./Req";
import ReqSample from "./ReqSample";
import ResComponent, { type Res } from "./Res";
import ResExample from "./ResExample";

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
  return (
    <div
      class={`grid flex-1 grid-rows-4 gap-3 ${
        waiting ? "pointer-events-none opacity-50" : ""
      }`}
    >
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
            }
          })()
        }
      />
      {err ? (
        <Err>{err}</Err>
      ) : (
        resSignal.value && <ResComponent resSignal={resSignal} />
      )}
      <ReqSample harRequestSignal={harRequestSignal} />
      {example && <ResExample example={example} />}
    </div>
  );
}
