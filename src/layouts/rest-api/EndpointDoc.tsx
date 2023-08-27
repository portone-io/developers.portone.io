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
              right={<ResponseDoc operation={operation} />}
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
  return (
    <>
      {pathParameters.length ? (
        <Parameters title="Path" parameters={pathParameters} />
      ) : null}
      {queryParameters.length ? (
        <Parameters title="Query" parameters={queryParameters} />
      ) : null}
      {bodyParameters.length ? (
        <Parameters title="Body" parameters={bodyParameters} />
      ) : null}
    </>
  );
}

interface ResponseDocProps {
  operation: Operation;
}
function ResponseDoc({ operation }: ResponseDocProps) {
  const responseParameters = getResponseParameters(operation);
  return (
    <>
      {Object.entries(responseParameters).map(
        ([statusCode, { parameters }]) => (
          <Parameters
            key={statusCode}
            title={statusCode}
            parameters={parameters}
          />
        )
      )}
    </>
  );
}

interface ParametersProps {
  title?: string;
  parameters: Parameter[];
}
function Parameters({ title, parameters }: ParametersProps) {
  return (
    <div>
      {title && <h4 class="text-xs font-bold uppercase">{title}</h4>}
      <div class="bg-slate-1 rounded p-2">
        {parameters.map((parameter) => {
          const { name, required, type } = parameter;
          return (
            <div class="font-mono">
              {name}
              {!required && "?"}: {type}
            </div>
          );
        })}
      </div>
    </div>
  );
}
