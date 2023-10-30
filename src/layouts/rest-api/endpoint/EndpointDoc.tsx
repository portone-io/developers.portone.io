import * as prose from "~/components/prose";
import TwoColumnLayout from "../TwoColumnLayout";
import { getEndpointRepr, type Endpoint } from "../schema-utils/endpoint";
import {
  Parameter,
  getOperation,
  getPathParameters,
  getQueryParameters,
  getBodyParameters,
  Operation,
  getResponseSchemata,
} from "../schema-utils/operation";
import {
  ReqPropertiesDoc,
  TypeDefDoc,
  TypeDefDocContainer,
} from "../category/type-def";
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
      <prose.h3 id={getEndpointRepr(endpoint)} class="target:text-orange-5">
        <div class="flex items-end gap-1 rounded font-mono text-sm opacity-70">
          <span class="text-base font-bold uppercase">{method}</span>
          <span>{path}</span>
        </div>
        <div class="flex items-center gap-2">
          <span>{title}</span>
          {deprecated && (
            <span class="bg-slate-1 px-2 text-sm uppercase opacity-70">
              deprecated
            </span>
          )}
          {unstable && (
            <span class="bg-slate-1 px-2 text-sm uppercase opacity-70">
              unstable
            </span>
          )}
        </div>
      </prose.h3>
      <TwoColumnLayout
        gap={6}
        left={
          <>
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
            <TwoColumnLayout
              className="mt-2"
              bp="md"
              gap={6}
              leftClassName="flex flex-col gap-2"
              rightClassName="flex flex-col gap-2"
              left={
                <RequestDoc
                  basepath={basepath}
                  schema={schema}
                  operation={operation}
                />
              }
              right={
                <ResponseDoc
                  basepath={basepath}
                  schema={schema}
                  operation={operation}
                />
              }
            />
          </>
        }
        smallRight
        right={renderRightFn?.({ schema, endpoint, operation })}
      />
    </div>
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
      <>
        {showPath && (
          <ReqParameters
            basepath={basepath}
            title="Path"
            parameters={pathParameters}
          />
        )}
        {showQuery && (
          <ReqParameters
            basepath={basepath}
            title="Query"
            parameters={queryParameters}
          />
        )}
        {showBody && (
          <ReqParameters
            basepath={basepath}
            title="Body"
            parameters={bodyParameters}
          />
        )}
      </>
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
    <>
      {responseSchemata.map(
        ([statusCode, { response, schema: responseSchema }]) => (
          <ReqRes
            key={statusCode}
            title={statusCode}
            description={response.description}
          >
            <TypeDefDocContainer>
              <TypeDefDoc
                basepath={basepath}
                schema={schema}
                typeDef={
                  responseSchema && resolveTypeDef(schema, responseSchema)
                }
              />
            </TypeDefDocContainer>
          </ReqRes>
        )
      )}
    </>
  );
}

interface ReqParametersProps {
  basepath: string;
  title?: string | undefined;
  description?: string | undefined;
  parameters: Parameter[];
}
function ReqParameters({
  basepath,
  title,
  description,
  parameters,
}: ReqParametersProps) {
  return (
    <ReqRes title={title} description={description}>
      <ReqPropertiesDoc basepath={basepath} properties={parameters} />
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
