/* @jsxImportSource solid-js */

import { Show, createSignal } from "solid-js";
import { clsx } from "clsx";
import { match } from "ts-pattern";
import type { Operation } from "../../../schema-utils";
import type { Endpoint } from "../../../schema-utils/endpoint";
import ResComponent, { type Res } from "./Res.solid";
import Req from "./Req.solid";
import Err from "./Err.solid";

export interface TryProps {
  apiHost: string;
  endpoint: Endpoint;
  operation: Operation;
}

type State =
  | { type: "waiting" }
  | { type: "resolved"; res: Res }
  | { type: "errored"; err: string };

export default function Try(props: TryProps) {
  const [state, setState] = createSignal<State | undefined>(undefined);
  return (
    <div
      class={clsx(
        "grid flex-1 grid-rows-2 gap-3",
        state()?.type === "waiting" && "pointer-events-none opacity-50",
      )}
    >
      <Req
        {...props}
        execute={async (fn) => {
          try {
            setState({ type: "waiting" });
            setState({ type: "resolved", res: await fn() });
          } catch (err) {
            setState({ type: "errored", err: (err as Error).message });
          }
        }}
      />
      <Show
        when={match(state())
          .with({ type: "errored" }, (state) => state.err)
          .otherwise(() => null)}
        fallback={
          <ResComponent
            res={match(state())
              .with({ type: "resolved" }, (state) => state.res)
              .otherwise(() => undefined)}
          />
        }
      >
        {(err) => <Err>{err()}</Err>}
      </Show>
    </div>
  );
}
