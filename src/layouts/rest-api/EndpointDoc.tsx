import * as prose from "~/components/prose";
import TwoColumnLayout from "./TwoColumnLayout";
import type { Endpoint } from "./schema-utils/endpoint";
import {
  Parameter,
  getOperation,
  getPathParameters,
  getQueryParameters,
  getBodyParameters,
  Operation,
  getResponseSchemata,
} from "./schema-utils/operation";
import { PropertiesDoc, TypeDefDoc } from "./type-def";
import { resolveTypeDef } from "./schema-utils/type-def";

export interface EndpointDocProps {
  schema: any;
  endpoint: Endpoint;
}
export default function EndpointDoc({ schema, endpoint }: EndpointDocProps) {
  const operation = getOperation(schema, endpoint);
  const { method, path, title, deprecated, unstable } = endpoint;
  return (
    <div class="flex flex-col">
      <prose.h3>
        <div class="text-slate-5 flex items-end gap-1 rounded font-mono text-sm">
          <span class="text-base font-bold uppercase">{method}</span>
          <span>{path}</span>
        </div>
        <div class="flex items-center gap-2">
          <span>{title}</span>
          {deprecated && (
            <span class="bg-slate-1 text-slate-5 px-2 text-sm uppercase">
              deprecated
            </span>
          )}
          {unstable && (
            <span class="bg-slate-1 text-slate-5 px-2 text-sm uppercase">
              unstable
            </span>
          )}
        </div>
      </prose.h3>
      <TwoColumnLayout
        left={
          <>
            {operation.description && (
              <article
                class="bg-slate-1 rounded p-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html: operation.description,
                }}
              />
            )}
            <TwoColumnLayout
              className="mt-2"
              leftClassName="flex flex-col gap-2"
              rightClassName="flex flex-col gap-2"
              left={<RequestDoc schema={schema} operation={operation} />}
              right={<ResponseDoc schema={schema} operation={operation} />}
              bp="md"
              gap={2}
            />
          </>
        }
        right={null}
      />
    </div>
  );
}

interface RequestDocProps {
  schema: any;
  operation: Operation;
}
function RequestDoc({ schema, operation }: RequestDocProps) {
  const pathParameters = getPathParameters(operation);
  const queryParameters = getQueryParameters(operation);
  const bodyParameters = getBodyParameters(schema, operation);
  const showPath = pathParameters.length > 0;
  const showQuery = queryParameters.length > 0;
  const showBody = bodyParameters.length > 0;
  if (showPath || showQuery || showBody) {
    return (
      <>
        {showPath && <Parameters title="Path" parameters={pathParameters} />}
        {showQuery && <Parameters title="Query" parameters={queryParameters} />}
        {showBody && <Parameters title="Body" parameters={bodyParameters} />}
      </>
    );
  }
  return <div class="text-slate-5 text-xs font-bold">요청 인자 없음</div>;
}

interface ResponseDocProps {
  schema: any;
  operation: Operation;
}
function ResponseDoc({ schema, operation }: ResponseDocProps) {
  const responseSchemata = getResponseSchemata(operation);
  return (
    <>
      {responseSchemata.map(
        ([statusCode, { response, schema: responseSchema }]) => (
          <ReqRes
            key={statusCode}
            title={statusCode}
            description={response.description}
          >
            <TypeDefDoc
              schema={schema}
              typeDef={responseSchema && resolveTypeDef(schema, responseSchema)}
            />
          </ReqRes>
        )
      )}
    </>
  );
}

interface ParametersProps {
  title?: string | undefined;
  description?: string | undefined;
  parameters: Parameter[];
}
function Parameters({ title, description, parameters }: ParametersProps) {
  return (
    <ReqRes title={title} description={description}>
      <PropertiesDoc properties={parameters} />
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
          <h4 class="font-bold uppercase">{title}</h4>
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
