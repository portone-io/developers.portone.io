import * as React from "react";
import * as prose from "~/components/prose";
import {
  expandAndScrollTo,
  expanded,
  useExpand,
} from "~/state/rest-api/expand-section";
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
} from "../schema-utils/type-def";
import Expand from "./Expand";
import DescriptionArea from "../DescriptionArea";
import { useSignal } from "@preact/signals";
import { interleave } from "..";

export interface TypeDefinitionsProps {
  basepath: string; // e.g. "/api/rest-v1"
  initialExpand?: boolean;
  schema: any;
}
export function TypeDefinitions({
  basepath,
  initialExpand = false,
  schema,
}: TypeDefinitionsProps) {
  React.useEffect(expanded);
  const { expand, onToggle } = useExpand("type-def", initialExpand);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const typeDefPropsList = crawlRefs(schema)
    .sort()
    .map((ref) => ({
      name: getTypenameByRef(ref),
      typeDef: getTypeDefByRef(schema, ref),
    }));
  return (
    <section id="type-def" class="scroll-mt-5.5rem flex flex-col">
      <prose.h2 ref={headingRef}>타입 정의</prose.h2>
      <div class="mt-4">
        API 요청/응답의 각 필드에서 사용되는 타입 정의들을 확인할 수 있습니다
      </div>
      <div class="border-slate-3 bg-slate-1 grid-flow-rows mt-4 grid gap-x-4 gap-y-1 rounded-lg border px-6 py-4 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {typeDefPropsList.map(({ name }) => {
          const href = `${basepath}/type-def#${name}`;
          return (
            <a
              key={name}
              class="hover:text-orange-5 underline-offset-4 transition-colors hover:underline"
              href={href}
              onClick={(e) => {
                e.preventDefault();
                expandAndScrollTo({ section: "type-def", href, id: name });
              }}
              data-norefresh
            >
              {name}
            </a>
          );
        })}
      </div>
      <Expand
        className="mt-10"
        expand={expand}
        onToggle={onToggle}
        onCollapse={() => {
          headingRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
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
              <TypeDefDocContainer>
                <TypeDefDoc
                  basepath={basepath}
                  schema={schema}
                  typeDef={typeDef}
                />
              </TypeDefDocContainer>
            </div>
          ))}
        </div>
      </Expand>
    </section>
  );
}

export interface TypeDefDocContainerProps {
  children: any;
}
export function TypeDefDocContainer({ children }: TypeDefDocContainerProps) {
  return <div class="bg-slate-1 rounded p-2">{children}</div>;
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
      return <EnumDoc xPortoneEnum={typeDef!["x-portone-enum"]} />;
    case "union":
      return (
        <UnionDoc basepath={basepath} schema={schema} typeDef={typeDef!} />
      );
  }
}

interface UnionDocProps {
  basepath: string;
  schema: any;
  typeDef: TypeDef;
}
function UnionDoc({ basepath, schema, typeDef }: UnionDocProps) {
  const { propertyName, mapping } = typeDef.discriminator!;
  const types = Object.keys(mapping);
  const typeSignal = useSignal(types[0]!);
  const type = typeSignal.value;
  return (
    <div class=" flex flex-col gap-4 rounded leading-none">
      <div class="flex items-center gap-1 text-xs">
        <code>{propertyName}</code>
        <span>값이</span>
        <div class="relative flex-1 py-1">
          &nbsp;
          <select
            class="border-slate-2 absolute left-0 top-0 w-full text-ellipsis whitespace-nowrap border px-2 py-1"
            value={typeSignal.value}
            onChange={(e) => (typeSignal.value = e.currentTarget.value)}
          >
            {types.map((type) => (
              <option value={type}>{type}</option>
            ))}
          </select>
        </div>
        <span>인 경우</span>
      </div>
      <TypeDefDoc
        basepath={basepath}
        schema={schema}
        typeDef={getTypeDefByRef(schema, mapping[type]!)}
      />
    </div>
  );
}

interface EnumDocProps {
  xPortoneEnum: TypeDef["x-portone-enum"];
}
function EnumDoc({ xPortoneEnum }: EnumDocProps) {
  return (
    <div class="flex flex-col gap-4">
      {Object.entries(xPortoneEnum || {}).map(([enumValue, enumCase]) => {
        const title = enumCase["x-portone-title"] || enumCase.title || "";
        return (
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 leading-none">
              <code>{enumValue}</code>
              <span class="text-slate-5 text-sm">{title}</span>
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
    <div class="flex flex-col gap-4">
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

export interface ReqPropertiesDocProps {
  basepath: string;
  properties: BakedProperty[];
}
export function ReqPropertiesDoc({
  basepath,
  properties,
}: ReqPropertiesDocProps) {
  return (
    <div class="flex flex-col gap-1">
      {properties.length ? (
        interleave(
          properties.map((property) => (
            <PropertyDoc
              basepath={basepath}
              name={property.name}
              required={property.required}
              property={property}
              bgColor="white"
            />
          )),
          <hr />
        )
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
  bgColor?: string | undefined;
}
function PropertyDoc({
  basepath,
  name,
  required,
  property,
  bgColor,
}: PropertyDocProps) {
  const title =
    property["x-portone-title"] ||
    property.title ||
    property["x-portone-name"] ||
    "";
  const deprecated = Boolean(property.deprecated);
  return (
    <div class={`flex flex-col gap-2 p-2 ${deprecated ? "opacity-50" : ""}`}>
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="mr-4 inline-block font-mono font-bold leading-tight">
            <span>{name}</span>
            <span class="-mr-[6px]">: </span>
            <TypeReprDoc basepath={basepath} def={property} />
          </div>
          <div class="text-slate-5 inline-block text-xs">
            {title && <span>{title}</span>}
          </div>
        </div>
        <div class="text-slate-5 inline-block shrink-0 text-xs">
          <span class="inline-block">{required ? "(필수)" : "(선택)"}</span>{" "}
          {deprecated && <span class="inline-block">(Deprecated)</span>}
        </div>
      </div>
      <DescriptionDoc typeDef={property} bgColor={bgColor} />
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
  if (!isUserType) {
    return <span class="text-green-6 font-bold">{typeRepr}</span>;
  }
  const typeName = typeRepr.replace("[]", "");
  const href = `${basepath}/type-def#${typeName}`;
  return (
    <a
      class="text-green-6 hover:text-orange-5 inline-block font-bold underline-offset-4 transition-colors hover:underline"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        expandAndScrollTo({ section: "type-def", href, id: typeName });
      }}
      data-norefresh
    >
      {typeRepr}
    </a>
  );
}

interface DescriptionDocProps {
  typeDef: TypeDef | Property;
  bgColor?: string | undefined;
}
function DescriptionDoc({
  typeDef,
  bgColor = "rgb(241,245,249)",
}: DescriptionDocProps) {
  const __html =
    (typeDef["x-portone-description"] ??
      typeDef["x-portone-summary"] ??
      typeDef.description ??
      typeDef.summary) ||
    "";
  return __html ? (
    <DescriptionArea maxHeightPx={16 * 6} bgColor={bgColor}>
      <div class="text-slate-5 flex flex-col gap-1 text-sm">
        <div dangerouslySetInnerHTML={{ __html }} />
      </div>
    </DescriptionArea>
  ) : null;
}
