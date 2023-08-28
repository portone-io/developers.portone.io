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
import { useSignal } from "@preact/signals";

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
  operation: Operation;
}
function ResponseDoc({ operation }: ResponseDocProps) {
  const responseParameters = getResponseParameters(operation);
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
      <div class="bg-slate-1 flex flex-col gap-4 rounded p-2">
        {parameters.length ? (
          parameters.map((parameter) => <Parameter parameter={parameter} />)
        ) : (
          <div class="text-slate-5 text-xs">(내용 없음)</div>
        )}
      </div>
    </div>
  );
}

interface ParameterProps {
  parameter: Parameter;
}
function Parameter({ parameter }: ParameterProps) {
  const showMoreSignal = useSignal(false);
  const { name, required, type } = parameter;
  const label = parameter["x-portone-name"] || "";
  const summary = parameter["x-portone-summary"] || parameter.summary || "";
  const description =
    parameter["x-portone-description"] || parameter.description || "";
  const showMore = showMoreSignal.value;
  const __html = showMore ? description : summary;
  return (
    <div class="flex flex-col gap-2">
      <div>
        <div class="text-slate-5 flex gap-1 text-xs">
          {label && <span>{label}</span>}
          <span>{required ? "(필수)" : "(선택)"}</span>
        </div>
        <div class="font-mono font-bold leading-none">
          <span>{name}</span>
          <span class="text-slate-5">: {type}</span>
        </div>
      </div>
      {__html && (
        <div class="text-slate-5 flex flex-col gap-1 text-sm">
          <div dangerouslySetInnerHTML={{ __html }} />
          {summary && description && (
            <button
              class="bg-slate-2 self-end px-1 text-xs"
              onClick={() => (showMoreSignal.value = !showMore)}
            >
              {showMore ? "간단히" : "자세히"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
