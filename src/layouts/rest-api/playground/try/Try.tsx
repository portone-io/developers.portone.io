import { useSignal } from "@preact/signals";
import type { Endpoint } from "../../schema-utils/endpoint";
import type { Operation } from "../../schema-utils/operation";
import ResComponent, { type Res } from "./Res";
import Req from "./Req";
import Err from "./Err";

export interface TryProps {
  apiHost: string;
  schema: any;
  endpoint: Endpoint;
  operation: Operation;
}
export default function Try(props: TryProps) {
  const errSignal = useSignal("");
  const err = errSignal.value;
  const resSignal = useSignal<Res | undefined>(undefined);
  return (
    <div class="grid flex-1 grid-rows-2 gap-2">
      <Req {...props} errSignal={errSignal} resSignal={resSignal} />
      {err ? <Err>{err}</Err> : <ResComponent resSignal={resSignal} />}
    </div>
  );
}
