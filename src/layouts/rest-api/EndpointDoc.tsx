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
  getResponseParameters,
} from "./schema-utils/operation";
import { PropertiesDoc } from "./type-def";

export interface EndpointDocProps {
  schema: any;
  endpoint: Endpoint;
}
export default function EndpointDoc({ schema, endpoint }: EndpointDocProps) {
  const operation = getOperation(schema, endpoint);
  return (
    <div class="flex flex-col">
      <prose.h3>
        <div class="text-slate-5 flex items-end gap-1 rounded font-mono text-sm">
          <span class="text-base font-bold uppercase">{endpoint.method}</span>
          <span>{endpoint.path}</span>
        </div>
        <div>{endpoint.title}</div>
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
              left={<RequestDoc operation={operation} />}
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
  operation: Operation;
}
function RequestDoc({ operation }: RequestDocProps) {
  const pathParameters = getPathParameters(operation);
  const queryParameters = getQueryParameters(operation);
  const bodyParameters = getBodyParameters(operation);
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
  const responseParameters = getResponseParameters(schema, operation);
  return (
    <>
      {responseParameters.map(([statusCode, { response, parameters }]) => (
        <Parameters
          key={statusCode}
          title={statusCode}
          parameters={parameters}
          description={response.description}
        />
      ))}
    </>
  );
}

interface ParametersProps {
  title?: string;
  description?: string | undefined;
  parameters: Parameter[];
}
function Parameters({ title, description, parameters }: ParametersProps) {
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
      <PropertiesDoc properties={parameters} />
    </div>
  );
}
