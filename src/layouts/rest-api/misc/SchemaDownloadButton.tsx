import type React from "preact/compat";
import { createRef } from "preact/compat";

import { getEveryEndpoints } from "../schema-utils/endpoint";
import {
  getOperation,
  isQueryOrBodyOperation,
} from "../schema-utils/operation";

export interface SchemaDownloadButtonProps {
  href: string;
  label: React.ReactNode;
  children: React.ReactNode;
}
export default function SchemaDownloadButton({
  href,
  label,
  children,
}: SchemaDownloadButtonProps) {
  const downloadRef = createRef<HTMLAnchorElement>();
  return (
    <div class="flex flex-col items-start gap-1 text-14px">
      <a
        ref={downloadRef}
        class="hidden"
        download="portone-api-schema.json"
        target="_blank"
      ></a>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded bg-slate-1 p-2 pr-3 font-bold hover:bg-slate-2"
        onClick={() =>
          void (async () => {
            const schema = await downloadSchema(href);
            const blob = new Blob([JSON.stringify(schema)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = downloadRef.current!;
            a.href = url;
            a.click();
          })()
        }
      >
        <i class="i-ic-baseline-download text-xl" />
        {label}
      </button>
      {children}
    </div>
  );
}

async function downloadSchema(href: string) {
  const response = await fetch(href);
  const schema = (await response.json()) as unknown;
  getEveryEndpoints(schema)
    .map((endpoint) => getOperation(schema, endpoint))
    .filter(({ parameters }) => parameters !== undefined)
    .filter(isQueryOrBodyOperation)
    .forEach((operation) => {
      delete operation.requestBody;
      operation.parameters!.forEach((parameter) => {
        if ("x-portone-query-or-body" in parameter) {
          const { required } = parameter["x-portone-query-or-body"]!;
          if (required) parameter.required = true;
          delete parameter["x-portone-query-or-body"];
        }
      });
    });
  return schema;
}

export interface PostmanGuideProps {
  href: string;
}
export function PostmanGuide({ href }: PostmanGuideProps) {
  return (
    <span class="text-sm text-slate-5">
      <a href={href} target="_blank" class="hover:underline">
        Postman 등에서 import하여 활용
      </a>
      할 수 있습니다.
    </span>
  );
}
