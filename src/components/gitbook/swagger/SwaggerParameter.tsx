import type { JSXElement } from "solid-js";

interface Props {
  name: string;
  type: string;
  required: boolean;
  children: JSXElement;
}

export default function SwaggerParameter(props: Props) {
  return (
    <div class="grid grid-cols-2 gap-2 border-b border-slate-1 py-2 text-sm text-slate-500 md:grid-cols-[1fr_8em_2fr] last:border-t-0">
      <div class="font-mono">
        <span>{props.name}</span>
        {String(props.required) === "true" && <span class="text-red-6">*</span>}
      </div>
      <div>{props.type}</div>
      <div class="col-span-2 md:col-auto">{props.children}</div>
    </div>
  );
}
