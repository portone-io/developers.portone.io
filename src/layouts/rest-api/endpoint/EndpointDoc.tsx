import type React from "preact/compat";

import * as prose from "~/components/prose";

import { ReqPropertiesDoc, TypeDefDoc } from "../category/type-def";
import DescriptionArea from "../DescriptionArea";
import { type Endpoint, getEndpointRepr } from "../schema-utils/endpoint";
import {
  getBodyParameters,
  getOperation,
  getPathParameters,
  getQueryParameters,
  getResponseSchemata,
  type Operation,
  type Parameter,
} from "../schema-utils/operation";
import { resolveTypeDef } from "../schema-utils/type-def";
import TwoColumnLayout from "../TwoColumnLayout";

export interface EndpointDocProps {
  basepath: string; // e.g. "/api/rest-v1"
  schema: unknown;
  endpoint: Endpoint;
  renderRightFn?: RenderRightFn;
}
export default function EndpointDoc({
  basepath,
  schema,
  endpoint,
  renderRightFn,
}: EndpointDocProps) {
  const operation = getOperation(schema, endpoint);
  const { method, path, title, deprecated, unstable } = endpoint;
  const description =
    operation["x-portone-description"] || operation.description;
  return (
    <div class="flex flex-col">
      <div class="grid mb-4 items-center gap-y-4 lg:grid-cols-2">
        <div class="flex items-center lg:order-last lg:justify-end">
          <MethodLine method={method} path={path} />
        </div>
        <prose.h3
          id={getEndpointRepr(endpoint)}
          class="target:text-orange-5"
          style={{ marginTop: 0 }}
        >
          <div class="flex items-center gap-2">
            <span>{title}</span>
            {deprecated && (
              <span class="rounded bg-slate-1 px-2 text-sm uppercase opacity-70">
                deprecated
              </span>
            )}
            {unstable && (
              <span class="rounded bg-slate-1 px-2 text-sm uppercase opacity-70">
                unstable
              </span>
            )}
          </div>
        </prose.h3>
      </div>
      <TwoColumnLayout
        gap={6}
        left={
          <div class="flex flex-col gap-6">
            {description && (
              <article class="overflow-hidden rounded">
                <DescriptionArea>
                  <div
                    class="p-2 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: description,
                    }}
                  />
                </DescriptionArea>
              </article>
            )}
            <RequestDoc
              basepath={basepath}
              schema={schema}
              operation={operation}
            />
            <ResponseDoc
              basepath={basepath}
              schema={schema}
              operation={operation}
            />
          </div>
        }
        smallRight
        right={renderRightFn?.({ schema, endpoint, operation })}
      />
    </div>
  );
}

export interface MethodLineProps {
  method: string;
  path: string;
}
export function MethodLine({ method, path }: MethodLineProps) {
  return (
    <span class="inline-flex items-center self-start gap-1 rounded-full bg-slate-1 pr-2 text-xs opacity-70">
      <MethodBadge method={method} />
      <span class="ml-1 font-normal font-mono">{path}</span>
    </span>
  );
}

interface MethodBadgeProps {
  method: string;
}
function MethodBadge({ method }: MethodBadgeProps) {
  const colorClass =
    method === "get"
      ? "bg-green-2 text-green-7"
      : method === "post"
        ? "bg-blue-2 text-blue-7"
        : method === "put"
          ? "bg-yellow-2 text-yellow-7"
          : method === "delete"
            ? "bg-red-2 text-red-7"
            : "bg-slate-2 text-slate-7";
  return (
    <span
      class={`${colorClass} shrink-0 rounded-full px-2 font-bold uppercase`}
    >
      {method}
    </span>
  );
}

export interface RenderRightConfig {
  schema: unknown;
  endpoint: Endpoint;
  operation: Operation;
}
export type RenderRightFn = (config: RenderRightConfig) => React.ReactNode;

interface RequestDocProps {
  basepath: string;
  schema: unknown;
  operation: Operation;
}
function RequestDoc({ basepath, schema, operation }: RequestDocProps) {
  const pathParameters = getPathParameters(operation);
  const queryParameters = getQueryParameters(operation);
  const bodyParameters = getBodyParameters(schema, operation);
  const showPath = pathParameters.length > 0;
  const showQuery = queryParameters.length > 0;
  const showBody = bodyParameters.length > 0;
  if (showPath || showQuery || showBody) {
    return (
      <div class="flex flex-col gap-2">
        <prose.h4 class="border-b pb-1" style={{ marginTop: 0 }}>
          Request
        </prose.h4>
        {showPath && (
          <ReqParameters
            basepath={basepath}
            title="Path"
            parameters={pathParameters}
            schema={schema}
            showNested
          />
        )}
        {showQuery && (
          <ReqParameters
            basepath={basepath}
            title="Query"
            parameters={queryParameters}
            schema={schema}
            showNested
          />
        )}
        {showBody && (
          <ReqParameters
            basepath={basepath}
            title="Body"
            parameters={bodyParameters}
            schema={schema}
            showNested
          />
        )}
      </div>
    );
  }
  return <div class="text-xs text-slate-5 font-bold">요청 인자 없음</div>;
}

interface ResponseDocProps {
  basepath: string;
  schema: unknown;
  operation: Operation;
}
function ResponseDoc({ basepath, schema, operation }: ResponseDocProps) {
  const responseSchemata = getResponseSchemata(schema, operation);
  return (
    <div class="flex flex-col gap-2">
      <prose.h4 class="border-b pb-1" style={{ marginTop: 0 }}>
        Response
      </prose.h4>
      {responseSchemata.map(
        ([statusCode, { response, schema: responseSchema }]) => (
          <ReqRes
            key={statusCode}
            title={statusCode}
            description={response.description}
          >
            <TypeDefDoc
              basepath={basepath}
              schema={schema}
              typeDef={responseSchema && resolveTypeDef(schema, responseSchema)}
              bgColor="#f1f5f9"
              nestedBgColor="#fcfdfe"
              showNested
            />
          </ReqRes>
        ),
      )}
    </div>
  );
}

interface ReqParametersProps {
  basepath: string;
  title?: string | undefined;
  description?: string | undefined;
  parameters: Parameter[];
  schema?: unknown;
  showNested?: boolean | undefined;
}
function ReqParameters({
  basepath,
  title,
  description,
  parameters,
  schema,
  showNested,
}: ReqParametersProps) {
  return (
    <ReqRes title={title} description={description}>
      <ReqPropertiesDoc
        basepath={basepath}
        properties={parameters}
        schema={schema}
        showNested={showNested}
      />
    </ReqRes>
  );
}

interface ReqResProps {
  title?: string | undefined;
  description?: string | undefined;
  children: React.ReactNode;
}
function ReqRes({ title, description, children }: ReqResProps) {
  return (
    <div>
      {title && (
        <div class="mb-1 inline-flex gap-2 text-xs">
          <h4 class="shrink-0 font-bold uppercase">{title}</h4>
          {description && (
            <div
              class="text-slate-5"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      )}
      {children}
    </div>
  );
}
