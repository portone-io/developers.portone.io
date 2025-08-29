import "./SwaggerResponse.css";

import type { JSXElement } from "solid-js";

interface Props {
  status: string;
  description: string;
  children: JSXElement;
}

export default function SwaggerResponse(props: Props) {
  return (
    <details class="group/swagger border-b border-slate-1 text-sm last:border-b-0">
      <summary class="grid grid-cols-[2fr_3fr_2em] cursor-pointer gap-2 border-l-4 border-l-transparent py-4">
        <div class="flex items-center font-bold">
          <span
            class={`mr-2 inline-block h-2 w-2 rounded-full ${
              props.status[0] == "2"
                ? "bg-green-6"
                : props.status[0] == "3"
                  ? "bg-yellow-5"
                  : props.status[0] == "4"
                    ? "bg-red-6"
                    : props.status[0] == "5"
                      ? "bg-red-6"
                      : ""
            }`}
          ></span>
          <span>{props.status}</span>
        </div>
        <div class="text-slate-5">{props.description}</div>
        <div class="chevron" role="img">
          <i class="i-ic-sharp-chevron-right inline-block group-hover/swagger:text-orange"></i>
        </div>
      </summary>
      {props.children}
    </details>
  );
}
