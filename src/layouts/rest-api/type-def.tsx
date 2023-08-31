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
  getTypeDefKind,
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
            <div key={name} class="flex flex-col gap-2">
              <prose.h3>
                <span>{name}</span>
                <span class="text-slate-4 ml-2 text-base">
                  {getTypeDefKind(typeDef)}
                </span>
              </prose.h3>
              <TypeDefDoc schema={schema} typeDef={typeDef} />
            </div>
          ))}
        </div>
      </Expand>
    </div>
  );
}

export interface TypeDefDocProps {
  schema: any;
  typeDef?: TypeDef | undefined;
}
export function TypeDefDoc({ schema, typeDef }: TypeDefDocProps) {
  const kind = getTypeDefKind(typeDef);
  switch (kind) {
    case "object":
      return <ObjectDoc schema={schema} typeDef={typeDef} />;
    case "enum":
      return <EnumDoc xPortoneCases={typeDef!["x-portone-cases"]!} />;
    case "union":
      return <UnionDoc typeDef={typeDef!} />;
  }
}

interface UnionDocProps {
  typeDef: TypeDef;
}
function UnionDoc({ typeDef }: UnionDocProps) {
  const { propertyName, mapping } = typeDef.discriminator!;
  return (
    <div class=" bg-slate-1 flex flex-col rounded px-2 py-3 leading-none">
      <div class="text-xs">
        <span>match </span>
        <code>union.{propertyName}</code>
      </div>
      <div class="flex flex-col gap-2">
        {Object.entries(mapping).map(([type, ref]) => {
          return (
            <div key={type} class="ml-2 font-mono">
              <span class="text-xs">
                <code>"{type}"</code>
                <span>{" => "}</span>
              </span>
              <span class="text-slate-5 font-bold">
                {getTypenameByRef(ref)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EnumDocProps {
  xPortoneCases: NonNullable<TypeDef["x-portone-cases"]>;
}
function EnumDoc({ xPortoneCases }: EnumDocProps) {
  return (
    <div class="bg-slate-1 flex flex-col gap-4 rounded px-2 py-3">
      {xPortoneCases.map((enumCase) => {
        const label = enumCase["x-portone-name"] || "";
        return (
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 leading-none">
              <code>{enumCase.case}</code>
              <span class="text-slate-5 text-sm">{label}</span>
            </div>
            <DescriptionDoc typeDef={enumCase} />
          </div>
        );
      })}
    </div>
  );
}

interface ObjectDocProps {
  schema: any;
  typeDef?: TypeDef | undefined;
}
function ObjectDoc({ schema, typeDef }: ObjectDocProps) {
  const properties = typeDef ? bakeProperties(schema, typeDef) : [];
  return <PropertiesDoc properties={properties} />;
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
  const label = property["x-portone-name"] || "";
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
      <DescriptionDoc typeDef={property} />
    </div>
  );
}

interface DescriptionDocProps {
  typeDef: TypeDef | Property;
}
function DescriptionDoc({ typeDef }: DescriptionDocProps) {
  const showMoreSignal = useSignal(false);
  const summary = typeDef["x-portone-summary"] || typeDef.summary || "";
  const description =
    typeDef["x-portone-description"] || typeDef.description || "";
  const showMore = showMoreSignal.value;
  const __html = showMore ? description : summary;
  return summary || description ? (
    <div class="text-slate-5 flex flex-col gap-1 text-sm">
      {__html && <div dangerouslySetInnerHTML={{ __html }} />}
      {description && (
        <button
          class="bg-slate-2 self-end px-1 text-xs"
          onClick={() => (showMoreSignal.value = !showMore)}
        >
          {showMore ? "간단히" : "자세히"}
        </button>
      )}
    </div>
  ) : null;
}
