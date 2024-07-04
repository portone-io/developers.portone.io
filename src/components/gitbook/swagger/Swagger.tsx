import type { JSXElement } from "solid-js";

import Details from "~/components/gitbook/Details";

import { MethodBadge } from ".";

interface Props {
  method: "get" | "post" | "put" | "delete";
  path: string;
  baseUrl: string;
  summary: string;
  children: JSXElement;
}

export default function Swagger(props: Props) {
  return (
    <Details>
      <Details.Summary>
        <div>
          <MethodBadge method={props.method} />
          <span class="ml-2 text-sm text-gray">
            <span>{props.baseUrl}</span>
            <span class="text-black font-bold">{props.path}</span>
          </span>
        </div>
        <div class="mt-3 font-bold">
          <p>{props.summary}</p>
        </div>
      </Details.Summary>
      <Details.Content>{props.children}</Details.Content>
    </Details>
  );
}
