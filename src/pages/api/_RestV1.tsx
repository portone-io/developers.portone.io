import RestApi, {
  Endpoint,
  Tag,
  TypeDefinitions,
} from "~/layouts/rest-api/RestApi";
import schema from "../../schema/v1.openapi.json";

(globalThis as any).schema = schema;

type Endpoints = [Endpoint, any][];
const everyEndpoints = Object.entries(schema.paths).flatMap(
  ([path, methods]) => {
    return Object.entries(methods).map(
      ([method, operation]) =>
        [
          { method: method.toUpperCase(), path } as Endpoint,
          operation,
        ] satisfies [Endpoint, any]
    );
  }
);

function filterEndpointsByTag(tag: string, endpoints: Endpoints): Endpoints {
  return endpoints.filter(([_, operation]) => operation.tags?.includes(tag));
}

export default function RestV1() {
  return (
    <RestApi title="PortOne REST API - V1">
      <p class="mt-4">
        결제완료된 정보, 결제취소, 상태별 결제목록 조회 등의 기능을 하는 REST
        API를 제공합니다.
      </p>
      <p>
        비인증 결제, 정기 자동결제 등 부가기능을 위한 REST API도 제공합니다.
      </p>
      {schema.tags.flatMap((tag) => {
        const endpoints = filterEndpointsByTag(tag.name, everyEndpoints);
        return [
          <hr class="my-8" />,
          <Tag
            schema={schema}
            title={tag.name}
            summary={tag.description}
            endpoints={endpoints.map(([endpoint]) => endpoint)}
          />,
        ];
      })}
      <hr class="my-8" />
      <TypeDefinitions
        schema={schema}
        typenames={Object.keys(schema.definitions).map(
          (path) => path.split("/").pop()!
        )}
      />
    </RestApi>
  );
}
