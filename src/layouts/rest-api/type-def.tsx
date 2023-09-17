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
  basepath: string; // e.g. "/api/rest-v1"
  expand?: boolean;
  schema: any;
}
export function TypeDefinitions({
  basepath,
  expand = false,
  schema,
}: TypeDefinitionsProps) {
  const expandSignal = useSignal(expand);
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
          <a
            class="hover:text-orange-5 underline-offset-4 transition-colors hover:underline"
            href={`${basepath}/type-def#${name}`}
            key={name}
          >
            {name}
          </a>
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
              <prose.h3 id={name} class="target:text-orange-5 text-slate-6">
                <span>{name}</span>
                <span class=" ml-2 text-base opacity-60">
                  {getTypeDefKind(typeDef)}
                </span>
              </prose.h3>
              <TypeDefDoc
                basepath={basepath}
                schema={schema}
                typeDef={typeDef}
              />
            </div>
          ))}
        </div>
      </Expand>
    </div>
  );
}

export interface TypeDefDocProps {
  basepath: string;
  schema: any;
  typeDef?: TypeDef | undefined;
}
export function TypeDefDoc({ basepath, schema, typeDef }: TypeDefDocProps) {
  const kind = getTypeDefKind(typeDef);
  switch (kind) {
    case "object":
      return (
        <ObjectDoc basepath={basepath} schema={schema} typeDef={typeDef} />
      );
    case "enum":
      return <EnumDoc xPortoneCases={typeDef!["x-portone-cases"]!} />;
    case "union":
      return <UnionDoc basepath={basepath} typeDef={typeDef!} />;
  }
}

interface UnionDocProps {
  basepath: string;
  typeDef: TypeDef;
}
function UnionDoc({ basepath, typeDef }: UnionDocProps) {
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
              <TypeReprDoc basepath={basepath} def={ref} />
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
  basepath: string;
  schema: any;
  typeDef?: TypeDef | undefined;
}
function ObjectDoc({ basepath, schema, typeDef }: ObjectDocProps) {
  const properties = typeDef ? bakeProperties(schema, typeDef) : [];
  return <PropertiesDoc basepath={basepath} properties={properties} />;
}

export interface PropertiesDocProps {
  basepath: string;
  properties: BakedProperty[];
}
export function PropertiesDoc({ basepath, properties }: PropertiesDocProps) {
  return (
    <div class="bg-slate-1 flex flex-col gap-4 rounded p-2">
      {properties.length ? (
        properties.map((property) => (
          <PropertyDoc
            basepath={basepath}
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
  basepath: string;
  name: string;
  required?: boolean | undefined;
  property: Property;
}
function PropertyDoc({ basepath, name, required, property }: PropertyDocProps) {
  const label = property["x-portone-name"] || "";
  const deprecated = Boolean(property.deprecated);
  return (
    <div class={`flex flex-col gap-2 ${deprecated ? "opacity-50" : ""}`}>
      <div>
        <div class="text-slate-5 flex gap-1 text-xs">
          {label && <span>{label}</span>}
          <span>{required ? "(필수)" : "(선택)"}</span>
          {deprecated && "(Deprecated)"}
        </div>
        <div class="font-mono font-bold leading-none">
          <span>{name}</span>
          <span>: </span>
          <TypeReprDoc basepath={basepath} def={property} />
        </div>
      </div>
      <DescriptionDoc typeDef={property} />
    </div>
  );
}

interface TypeReprDocProps {
  basepath: string;
  def: string | TypeDef | Property;
}
function TypeReprDoc({ basepath, def }: TypeReprDocProps) {
  const typeRepr = repr(def);
  const isUserType = typeRepr[0]?.toUpperCase() === typeRepr[0];
  return isUserType ? (
    <a
      class="text-slate-5 hover:text-orange-5 font-bold underline-offset-4 transition-colors hover:underline"
      href={`${basepath}/type-def#${typeRepr.replace("[]", "")}`}
    >
      {typeRepr}
    </a>
  ) : (
    <span class="text-slate-5 font-bold">{typeRepr}</span>
  );
}

interface DescriptionDocProps {
  typeDef: TypeDef | Property;
}
function DescriptionDoc({ typeDef }: DescriptionDocProps) {
  const showMoreSignal = useSignal(false);
  const summary = (typeDef["x-portone-summary"] ?? typeDef.summary) || "";
  const description =
    (typeDef["x-portone-description"] ?? typeDef.description) || "";
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
