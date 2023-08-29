import { useSignal } from "@preact/signals";
import * as prose from "~/components/prose";
import {
  type BakedProperty,
  type Property,
  type TypeDef,
  bakeProperties,
  crawlRefs,
  getTypeDefByRef,
  getTypenameByRef,
  repr,
} from "./schema-utils/type-def";
import Expand from "./Expand";

export interface TypeDefinitionsProps {
  schema: any;
}
export function TypeDefinitions({ schema }: TypeDefinitionsProps) {
  const expandSignal = useSignal(false);
  const typeDefPropsList = crawlRefs(schema)
    .sort()
    .map((ref) => ({
      name: getTypenameByRef(ref),
      typeDef: getTypeDefByRef(schema, ref),
    }));
  return (
    <div class="flex flex-col">
      <prose.h2>타입 정의</prose.h2>
      <div class="mt-4">
        API 요청/응답의 각 필드에서 사용되는 타입 정의들을 확인할 수 있습니다
      </div>
      <div class="border-slate-3 bg-slate-1 grid-flow-rows mt-4 grid gap-x-4 gap-y-1 rounded-lg border px-6 py-4 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {typeDefPropsList.map(({ name }) => (
          <span key={name}>{name}</span>
        ))}
      </div>
      <Expand
        className="mt-10"
        expand={expandSignal.value}
        onExpand={(v) => (expandSignal.value = v)}
      >
        <div class="grid-flow-rows grid gap-4 lg:grid-cols-2">
          {typeDefPropsList.map(({ name, typeDef }) => (
            <TypeDefDoc
              key={name}
              schema={schema}
              name={name}
              typeDef={typeDef}
            />
          ))}
        </div>
      </Expand>
    </div>
  );
}

interface TypeDefDocProps {
  schema: any;
  name: string;
  typeDef: TypeDef;
}
function TypeDefDoc({ schema, name, typeDef }: TypeDefDocProps) {
  const properties = bakeProperties(schema, typeDef);
  return (
    <div class="flex flex-col gap-2">
      <prose.h3>{name}</prose.h3>
      <PropertiesDoc properties={properties} />
    </div>
  );
}

export interface PropertiesDocProps {
  properties: BakedProperty[];
}
export function PropertiesDoc({ properties }: PropertiesDocProps) {
  return (
    <div class="bg-slate-1 flex flex-col gap-4 rounded p-2">
      {properties.length ? (
        properties.map((property) => (
          <PropertyDoc
            name={property.name}
            required={property.required}
            property={property}
          />
        ))
      ) : (
        <div class="text-slate-5 text-xs">(내용 없음)</div>
      )}
    </div>
  );
}

interface PropertyDocProps {
  name: string;
  required?: boolean | undefined;
  property: Property;
}
function PropertyDoc({ name, required, property }: PropertyDocProps) {
  const showMoreSignal = useSignal(false);
  const label = property["x-portone-name"] || "";
  const summary = property["x-portone-summary"] || property.summary || "";
  const description =
    property["x-portone-description"] || property.description || "";
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
          <span class="text-slate-5">: {repr(property)}</span>
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
