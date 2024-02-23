/* @jsxImportSource solid-js */

import { Match, Switch } from "solid-js";

export interface MethodBadgeProps {
  method: "get" | "post" | "put" | "delete";
}
export function MethodBadge(props: MethodBadgeProps) {
  return (
    <Switch>
      <Match when={props.method === "get"}>
        <span class="bg-indigo-6 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
          GET
        </span>
      </Match>
      <Match when={props.method === "post"}>
        <span class="bg-green-6 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
          POST
        </span>
      </Match>
      <Match when={props.method === "put"}>
        <span class="bg-orange-7 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
          PUT
        </span>
      </Match>
      <Match when={props.method === "delete"}>
        <span class="bg-red-6 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
          DELETE
        </span>
      </Match>
    </Switch>
  );
}
