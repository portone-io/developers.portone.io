import type { JSXElement } from "solid-js";

import Card from "../Card";

export interface ErrProps {
  children: JSXElement;
}
export default function Err(props: ErrProps) {
  return (
    <Card titleClass="bg-slate-1" title="Error">
      <div class="relative flex-1">
        <div class="text-red-6 absolute h-full w-full overflow-scroll p-4 pt-2 text-sm whitespace-pre-wrap">
          {props.children}
        </div>
      </div>
    </Card>
  );
}
