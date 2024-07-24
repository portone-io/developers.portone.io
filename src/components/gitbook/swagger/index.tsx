import { Match, Switch } from "solid-js";

export interface MethodBadgeProps {
  method: "get" | "post" | "put" | "delete";
}
export function MethodBadge(props: MethodBadgeProps) {
  return (
    <Switch>
      <Match when={props.method === "get"}>
        <span class="rounded-full bg-indigo-6 px-2 py-1 text-xs text-white font-bold tracking-widest">
          GET
        </span>
      </Match>
      <Match when={props.method === "post"}>
        <span class="rounded-full bg-green-6 px-2 py-1 text-xs text-white font-bold tracking-widest">
          POST
        </span>
      </Match>
      <Match when={props.method === "put"}>
        <span class="rounded-full bg-orange-7 px-2 py-1 text-xs text-white font-bold tracking-widest">
          PUT
        </span>
      </Match>
      <Match when={props.method === "delete"}>
        <span class="rounded-full bg-red-6 px-2 py-1 text-xs text-white font-bold tracking-widest">
          DELETE
        </span>
      </Match>
    </Switch>
  );
}
