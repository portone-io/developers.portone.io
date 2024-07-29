import type { APIHandler } from "@solidjs/start/server";

import { getEveryEndpoints } from "~/layouts/rest-api/schema-utils/endpoint";
import {
  getOperation,
  isQueryOrBodyOperation,
} from "~/layouts/rest-api/schema-utils/operation";

import v1Schema from "../../../../../schema/v1.openapi.json";
import v2Schema from "../../../../../schema/v2.openapi.json";

const schemaMap = new Promise<Map<string, string>>((res) =>
  res(
    new Map(
      Object.entries({
        v1: JSON.stringify(transformSchema(v1Schema)),
        v2: JSON.stringify(transformSchema(v2Schema)),
      }),
    ),
  ),
);

export const GET: APIHandler = async ({ params }): Promise<Response> => {
  const version = params.version as string | undefined;
  const schema = (await schemaMap).get(version ?? "");
  if (!schema) return new Response(null, { status: 404 });

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
