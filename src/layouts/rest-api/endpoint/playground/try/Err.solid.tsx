/* @jsxImportSource solid-js */

import type { JSX } from "solid-js";
import Card from "../Card.solid";

export interface ErrProps {
  children: JSX.Element;
}
export default function Err(props: ErrProps) {
  return (
    <Card titleClass="bg-slate-1" title="Error">
      <div class="relative flex-1">
        <div class="text-red-6 absolute h-full w-full overflow-scroll whitespace-pre-wrap p-4 pt-2 text-sm">
          {props.children}
        </div>
      </div>
    </Card>
  );
}
