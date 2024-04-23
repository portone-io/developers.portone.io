import type { APIRoute } from "astro";

import { getEveryEndpoints } from "~/layouts/rest-api/schema-utils/endpoint";
import {
  getOperation,
  isQueryOrBodyOperation,
} from "~/layouts/rest-api/schema-utils/operation";

import v1Schema from "../../../schema/v1.openapi.json";
import v2Schema from "../../../schema/v2.openapi.json";

export const prerender = true;

export function getStaticPaths() {
  return [{ params: { version: "v1" } }, { params: { version: "v2" } }];
}

const schemaMap = new Map(
  Object.entries({
    v1: JSON.stringify(transformSchema(v1Schema)),
    v2: JSON.stringify(transformSchema(v2Schema)),
  }),
);

export const GET: APIRoute = ({ params, redirect }) => {
  const { version } = params;
  const schema = schemaMap.get(version ?? "");
  if (!schema) return redirect("/404");

  return new Response(schema, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

function transformSchema(schema: unknown): unknown {
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
