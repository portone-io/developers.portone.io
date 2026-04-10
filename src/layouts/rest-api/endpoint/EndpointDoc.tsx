import { Collapsible } from "@kobalte/core/collapsible";
import { createMemo, For, type JSXElement, Show } from "solid-js";

import Parameter from "~/components/parameter/Parameter";
import { prose } from "~/components/prose";

import { ReqPropertiesDoc, TypeDefDoc } from "../category/type-def";
import { type Endpoint, getEndpointRepr } from "../schema-utils/endpoint";
import {
  getBodyParameters,
  getOperation,
  getPathParameters,
  getQueryParameters,
  getResponseSchemata,
  isQueryOrBodyOperation,
  type Operation,
  type Parameter as OperationParameter,
} from "../schema-utils/operation";
import { resolveTypeDef } from "../schema-utils/type-def";
import TwoColumnLayout from "../TwoColumnLayout";

export interface EndpointDocProps {
  basepath: string; // e.g. "/api/rest-v1"
  schema: unknown;
  endpoint: Endpoint;
  renderRightFn?: RenderRightFn;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export default function EndpointDoc(props: EndpointDocProps) {
  const operation = createMemo(() =>
    getOperation(props.schema, props.endpoint),
  );
  const description = createMemo(
    () => operation()["x-portone-description"] || operation().description,
  );
  const endpointId = createMemo(() => getEndpointRepr(props.endpoint));

  const header = () => (
    <div class="mb-4 grid items-center gap-y-4 lg:grid-cols-2">
      <div class="flex items-center lg:order-last lg:justify-end">
        <MethodLine method={props.endpoint.method} path={props.endpoint.path} />
      </div>
      <prose.h3 id={endpointId()} class="target:text-orange-5 !mt-0">
        <div class="flex items-center gap-2">
          <span>{props.endpoint.title}</span>
          <Show when={props.endpoint.deprecated}>
            <span class="bg-slate-1 rounded px-2 text-sm uppercase opacity-70">
              deprecated
            </span>
          </Show>
          <Show when={props.endpoint.unstable}>
            <span class="bg-slate-1 rounded px-2 text-sm uppercase opacity-70">
              unstable
            </span>
          </Show>
        </div>
      </prose.h3>
    </div>
  );

  const collapsibleHeader = () => (
    <div class="flex flex-col gap-1">
      <prose.h3
        id={endpointId()}
        class="target:text-orange-5 !mt-0 !mb-0 !text-base"
      >
        <div class="flex items-center gap-2">
          <span>{props.endpoint.title}</span>
          <Show when={props.endpoint.deprecated}>
            <span class="bg-slate-1 rounded px-2 text-sm uppercase opacity-70">
              deprecated
            </span>
          </Show>
          <Show when={props.endpoint.unstable}>
            <span class="bg-slate-1 rounded px-2 text-sm uppercase opacity-70">
              unstable
            </span>
          </Show>
        </div>
      </prose.h3>
      <MethodLine method={props.endpoint.method} path={props.endpoint.path} />
      <Show when={description()}>
        <div
          data-search-description
          class="text-slate-5 text-sm"
          innerHTML={description()}
        />
      </Show>
    </div>
  );

  const content = () => (
    <TwoColumnLayout
      gap={6}
      left={() => (
        <div class="flex flex-col gap-6">
          <Show when={description() && !props.collapsible}>
            <div
              data-search-description
              class="p-2 text-sm"
              innerHTML={description()}
            />
          </Show>
          <RequestDoc
            basepath={props.basepath}
            schema={props.schema}
            operation={operation()}
          />
          <ResponseDoc
            basepath={props.basepath}
            schema={props.schema}
            operation={operation()}
          />
        </div>
      )}
      smallRight
      right={() =>
        props.renderRightFn?.({
          schema: () => props.schema,
          endpoint: () => props.endpoint,
          operation,
        })
      }
    />
  );

  return (
    <Show
      when={props.collapsible}
      fallback={
        <div class="flex flex-col">
          {header()}
          {content()}
        </div>
      }
    >
      <Collapsible
        open={props.open}
        onOpenChange={props.onOpenChange}
        class="flex flex-col [&[data-expanded]_.chevron]:origin-center [&[data-expanded]_.chevron]:rotate-90"
      >
        <Collapsible.Trigger
          as="a"
          href={`#${encodeURIComponent(endpointId())}`}
          class="relative w-full cursor-pointer text-left"
        >
          <div class="chevron absolute top-1 -left-4 h-4 w-4 transition-transform">
            <i class="icon-[ic--sharp-chevron-right] text-slate-4 inline-block h-4 w-4" />
          </div>
          {collapsibleHeader()}
        </Collapsible.Trigger>
        <Collapsible.Content class="mt-4">{content()}</Collapsible.Content>
      </Collapsible>
    </Show>
  );
}

export interface MethodLineProps {
  method: string;
  path: string;
}
export function MethodLine(props: MethodLineProps) {
  return (
    <span
      data-search-method
      class="bg-slate-1 inline-flex items-center gap-1 self-start rounded-full pr-2 text-xs opacity-70"
    >
      <MethodBadge method={props.method} />
      <span class="ml-1 font-mono font-normal">{props.path}</span>
    </span>
  );
}

interface MethodBadgeProps {
  method: string;
}
function MethodBadge(props: MethodBadgeProps) {
  const colorClass = createMemo(() =>
    props.method === "get"
      ? "bg-green-2 text-green-7"
      : props.method === "post"
        ? "bg-blue-2 text-blue-7"
        : props.method === "put"
          ? "bg-yellow-2 text-yellow-7"
          : props.method === "delete"
            ? "bg-red-2 text-red-7"
            : "bg-slate-2 text-slate-7",
  );
  return (
    <span
      class={`${colorClass()} shrink-0 rounded-full px-2 font-bold uppercase`}
    >
      {props.method}
    </span>
  );
}

export interface RenderRightConfig {
  schema: () => unknown;
  endpoint: () => Endpoint;
  operation: () => Operation;
}
export type RenderRightFn = (config: RenderRightConfig) => JSXElement;

interface RequestDocProps {
  basepath: string;
  schema: unknown;
  operation: Operation;
}
function RequestDoc(props: RequestDocProps) {
  const isQueryOrBody = createMemo(() =>
    isQueryOrBodyOperation(props.operation),
  );
  const pathParameters = createMemo(() => getPathParameters(props.operation));
  const queryParameters = createMemo(() =>
    getQueryParameters(props.operation, isQueryOrBody()),
  );
  const bodyParameters = createMemo(() =>
    getBodyParameters(props.schema, props.operation),
  );
  const showPath = createMemo(() => pathParameters().length > 0);
  const showQuery = createMemo(() => queryParameters().length > 0);
  const showBody = createMemo(() => bodyParameters().length > 0);
  return (
    <Show
      when={showPath || showQuery || showBody}
      fallback={
        <div class="text-slate-5 text-xs font-bold">요청 인자 없음</div>
      }
    >
      <div class="flex flex-col gap-2">
        <prose.h4 class="!mt-0 border-b pb-1">Request</prose.h4>
        <Show when={isQueryOrBody()}>
          <prose.h5 class="text-slate-5">
            body를 쿼리 문자열에 포함시켜 보낼 수 있습니다.{" "}
            <prose.a href="#get-with-body">자세히 보기</prose.a>
          </prose.h5>
        </Show>
        <Show when={showPath()}>
          <ReqParameters
            basepath={props.basepath}
            title="Path"
            parameters={pathParameters()}
            schema={props.schema}
          />
        </Show>
        <Show when={showQuery()}>
          <ReqParameters
            basepath={props.basepath}
            title="Query"
            parameters={queryParameters()}
            schema={props.schema}
          />
        </Show>
        <Show when={showBody()}>
          <ReqParameters
            basepath={props.basepath}
            title="Body"
            parameters={bodyParameters()}
            schema={props.schema}
          />
        </Show>
      </div>
    </Show>
  );
}

interface ResponseDocProps {
  basepath: string;
  schema: unknown;
  operation: Operation;
}
function ResponseDoc(props: ResponseDocProps) {
  const responseSchemata = createMemo(() =>
    getResponseSchemata(props.schema, props.operation),
  );
  const successResponse = createMemo(() =>
    responseSchemata().find(([statusCode]) => statusCode === "200"),
  );

  const nonSuccessResponses = createMemo(() =>
    responseSchemata().filter(([statusCode]) => statusCode !== "200"),
  );

  return (
    <div class="flex flex-col gap-2">
      <prose.h4 class="!mt-0 border-b pb-1">Response</prose.h4>
      <Show when={successResponse()}>
        {(response) => {
          const [_statusCode, schemata] = response();
          return (
            <ReqRes title="200 Ok">
              <Show when={schemata.response.description}>
                <div
                  innerHTML={schemata.response.description}
                  class="text-slate-11 mb-2 text-sm"
                />
              </Show>
              <Show when={schemata.schema}>
                {(typeDef) => (
                  <Parameter>
                    <TypeDefDoc
                      basepath={props.basepath}
                      schema={props.schema}
                      typeDef={resolveTypeDef(props.schema, typeDef())}
                      showNested
                    />
                  </Parameter>
                )}
              </Show>
            </ReqRes>
          );
        }}
      </Show>
      <For each={nonSuccessResponses()}>
        {([statusCode, schemata]) => {
          const isError =
            statusCode.startsWith("4") || statusCode.startsWith("5");
          const is207 = statusCode === "207";
          const title = isError
            ? `${statusCode} Error`
            : is207
              ? `${statusCode} Partial Success`
              : statusCode;
          return (
            <ReqRes title={title}>
              <Show when={schemata.response.description}>
                <div
                  innerHTML={schemata.response.description}
                  class="text-slate-11 mb-2 text-sm"
                />
              </Show>
              <Show when={schemata.schema}>
                {(typeDef) => (
                  <TypeDefDoc
                    basepath={props.basepath}
                    schema={props.schema}
                    typeDef={resolveTypeDef(props.schema, typeDef())}
                    showNested
                  />
                )}
              </Show>
            </ReqRes>
          );
        }}
      </For>
    </div>
  );
}

interface ReqParametersProps {
  basepath: string;
  title: string;
  description?: string | undefined;
  parameters: OperationParameter[];
  schema?: unknown;
}
function ReqParameters(props: ReqParametersProps) {
  return (
    <ReqRes title={props.title} description={props.description}>
      <Parameter>
        <ReqPropertiesDoc
          basepath={props.basepath}
          properties={props.parameters}
          schema={props.schema}
          showNested
        />
      </Parameter>
    </ReqRes>
  );
}

interface ReqResProps {
  title: string;
  description?: string | undefined;
  children: JSXElement;
}
function ReqRes(props: ReqResProps) {
  return (
    <Parameter flatten>
      <Show when={props.title}>
        <div class="mb-1 inline-flex gap-2 text-xs">
          <h4 class="shrink-0 font-bold uppercase">{props.title}</h4>
          <Show when={props.description}>
            {(description) => <span innerHTML={description()} />}
          </Show>
        </div>
      </Show>
      {props.children}
    </Parameter>
  );
}
