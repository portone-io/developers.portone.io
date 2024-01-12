import * as prose from "~/components/prose";
import TwoColumnLayout from "../TwoColumnLayout";
import { getEndpointRepr, type Endpoint } from "../schema-utils/endpoint";
import {
  type Parameter,
  getOperation,
  getPathParameters,
  getQueryParameters,
  getBodyParameters,
  type Operation,
  getResponseSchemata,
} from "../schema-utils/operation";
import { ReqPropertiesDoc, TypeDefDoc } from "../category/type-def";
import { resolveTypeDef } from "../schema-utils/type-def";
import DescriptionArea from "../DescriptionArea";

export interface EndpointDocProps {
  basepath: string; // e.g. "/api/rest-v1"
  schema: any;
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
      <div class="mb-4 grid lg:grid-cols-2">
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
              <span class="bg-slate-1 rounded px-2 text-sm uppercase opacity-70">
                deprecated
              </span>
            )}
            {unstable && (
              <span class="bg-slate-1 rounded px-2 text-sm uppercase opacity-70">
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
    <span class="bg-slate-1 inline-flex items-center gap-1 self-start rounded-full pr-2 text-xs opacity-70">
      <MethodBadge method={method} />
      <span class="ml-1 font-mono font-normal">{path}</span>
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
  schema: any;
  endpoint: Endpoint;
  operation: Operation;
}
export type RenderRightFn = (config: RenderRightConfig) => any;

interface RequestDocProps {
  basepath: string;
  schema: any;
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
  return <div class="text-slate-5 text-xs font-bold">요청 인자 없음</div>;
}

interface ResponseDocProps {
  basepath: string;
  schema: any;
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
  schema?: any;
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
  children: any;
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
