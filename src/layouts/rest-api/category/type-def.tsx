import * as React from "react";
import { useComputed, useSignal } from "@preact/signals";
import * as prose from "~/components/prose";
import {
  expandAndScrollTo,
  expanded,
  useExpand,
} from "~/state/rest-api/expand-section";
import { interleave } from "..";
import DescriptionArea from "../DescriptionArea";
import type { CategoryEndpointsPair } from "../schema-utils/endpoint";
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
  resolveTypeDef,
} from "../schema-utils/type-def";
import Expand from "./Expand";

export interface TypeDefinitionsProps {
  basepath: string; // e.g. "/api/rest-v1"
  initialExpand?: boolean;
  endpointGroups: CategoryEndpointsPair[];
  schema: any;
}
export function TypeDefinitions({
  basepath,
  initialExpand = false,
  endpointGroups,
  schema,
}: TypeDefinitionsProps) {
  React.useEffect(expanded);
  const { expand, onToggle } = useExpand("type-def", initialExpand);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const typeDefPropsList = crawlRefs(schema, endpointGroups)
    .sort()
    .map((ref) => ({
      name: getTypenameByRef(ref),
      typeDef: getTypeDefByRef(schema, ref),
    }));
  return (
    <section id="type-def" class="scroll-mt-5.2rem flex flex-col">
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
        className="mt-20"
        title="타입 정의"
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
              <TypeDefDoc
                basepath={basepath}
                schema={schema}
                typeDef={typeDef}
                bgColor="#f1f5f9"
                nestedBgColor="#fcfdfe"
              />
            </div>
          ))}
        </div>
      </Expand>
    </section>
  );
}

export interface TypeDefDocProps {
  basepath: string;
  schema: any;
  typeDef?: TypeDef | undefined;
  showNested?: boolean | undefined;
  bgColor: string;
  nestedBgColor?: string | undefined;
}
export function TypeDefDoc({
  basepath,
  schema,
  typeDef,
  showNested,
  bgColor,
  nestedBgColor,
}: TypeDefDocProps) {
  const kind = getTypeDefKind(typeDef);
  switch (kind) {
    case "object":
      return (
        <ObjectDoc
          basepath={basepath}
          schema={schema}
          typeDef={typeDef}
          showNested={showNested}
          bgColor={bgColor}
          nestedBgColor={nestedBgColor}
        />
      );
    case "enum":
      return (
        <EnumDoc
          basepath={basepath}
          xPortoneEnum={typeDef!["x-portone-enum"]}
          bgColor={bgColor}
        />
      );
    case "union":
      return (
        <UnionDoc
          basepath={basepath}
          schema={schema}
          typeDef={typeDef!}
          showNested={showNested}
          bgColor={bgColor}
          nestedBgColor={nestedBgColor}
        />
      );
  }
}

interface UnionDocProps {
  basepath: string;
  schema: any;
  typeDef: TypeDef;
  showNested?: boolean | undefined;
  bgColor: string;
  nestedBgColor?: string | undefined;
}
function UnionDoc({
  basepath,
  schema,
  typeDef,
  showNested,
  bgColor,
  nestedBgColor,
}: UnionDocProps) {
  const { propertyName, mapping } = typeDef.discriminator!;
  const types = Object.keys(mapping);
  const typeSignal = useSignal(types[0]!);
  const selectedTypeDefSignal = useComputed(() => {
    const type = typeSignal.value;
    return getTypeDefByRef(schema, mapping[type]!);
  });
  const propertiesSignal = useComputed(() => {
    const selectedTypeDef = selectedTypeDefSignal.value;
    return typeDef ? bakeProperties(schema, selectedTypeDef) : [];
  });
  const discriminatorPropertySignal = useComputed(() => {
    const properties = propertiesSignal.value;
    return properties.find((property) => property.name === propertyName)!;
  });
  const otherPropertiesSignal = useComputed(() => {
    const properties = propertiesSignal.value;
    return properties.filter((property) => property.name !== propertyName);
  });
  const discriminatorProperty = discriminatorPropertySignal.value;
  const otherProperties = otherPropertiesSignal.value;
  return (
    <div class="flex flex-col gap-2">
      <div class="rounded py-1" style={{ backgroundColor: bgColor }}>
        <PropertyDoc
          basepath={basepath}
          name={discriminatorProperty.name}
          required={true}
          property={discriminatorProperty}
          bgColor={bgColor}
          nestedBgColor={nestedBgColor}
        >
          <select
            class="border-slate-2 w-full text-ellipsis whitespace-nowrap rounded border px-2 py-1"
            value={typeSignal.value}
            onChange={(e) => (typeSignal.value = e.currentTarget.value)}
          >
            {types.map((type) => (
              <option value={type}>{type}</option>
            ))}
          </select>
        </PropertyDoc>
      </div>
      {otherProperties.map((property) => (
        <div
          class="rounded py-1"
          key={property.name}
          style={{ backgroundColor: bgColor }}
        >
          <PropertyDoc
            basepath={basepath}
            name={property.name}
            required={property.required}
            property={property}
            bgColor={bgColor}
            nestedBgColor={nestedBgColor}
            schema={schema}
            showNested={showNested}
          />
        </div>
      ))}
    </div>
  );
}

interface EnumDocProps {
  basepath: string;
  xPortoneEnum: TypeDef["x-portone-enum"];
  bgColor: string;
}
function EnumDoc({ basepath, xPortoneEnum, bgColor }: EnumDocProps) {
  return (
    <div class="flex flex-col gap-2">
      {Object.entries(xPortoneEnum || {}).map(([enumValue, enumCase]) => {
        const title = enumCase["x-portone-title"] || enumCase.title || "";
        return (
          <div
            class="flex flex-col gap-2 rounded p-2"
            style={{ backgroundColor: bgColor }}
          >
            <div class="flex items-center gap-2 leading-none">
              <code>{enumValue}</code>
              <span class="text-slate-5 text-sm">{title}</span>
            </div>
            <DescriptionDoc
              basepath={basepath}
              typeDef={enumCase}
              bgColor={bgColor}
            />
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
  showNested?: boolean | undefined;
  bgColor: string;
  nestedBgColor?: string | undefined;
}
function ObjectDoc({
  basepath,
  schema,
  typeDef,
  showNested,
  bgColor,
  nestedBgColor,
}: ObjectDocProps) {
  const properties = typeDef ? bakeProperties(schema, typeDef) : [];
  return (
    <PropertiesDoc
      basepath={basepath}
      bgColor={bgColor}
      nestedBgColor={nestedBgColor}
      schema={schema}
      properties={properties}
      showNested={showNested}
    />
  );
}

export interface PropertiesDocProps {
  basepath: string;
  properties: BakedProperty[];
  bgColor: string;
  nestedBgColor?: string | undefined;
  schema?: any;
  showNested?: boolean | undefined;
}
export function PropertiesDoc({
  basepath,
  bgColor,
  nestedBgColor,
  schema,
  properties,
  showNested,
}: PropertiesDocProps) {
  return (
    <div class="flex flex-col gap-2">
      {properties.map((property) => (
        <div
          class="rounded py-1"
          key={property.name}
          style={{ backgroundColor: bgColor }}
        >
          <PropertyDoc
            basepath={basepath}
            name={property.name}
            required={property.required}
            property={property}
            bgColor={bgColor}
            nestedBgColor={nestedBgColor}
            schema={schema}
            showNested={showNested}
          />
        </div>
      ))}
    </div>
  );
}

export interface ReqPropertiesDocProps {
  basepath: string;
  properties: BakedProperty[];
  schema?: any;
  showNested?: boolean | undefined;
}
export function ReqPropertiesDoc({
  basepath,
  properties,
  schema,
  showNested,
}: ReqPropertiesDocProps) {
  return (
    <div class="flex flex-col gap-1">
      {properties.length
        ? interleave(
            properties.map((property) => (
              <PropertyDoc
                basepath={basepath}
                name={property.name}
                required={property.required}
                property={property}
                bgColor="white"
                nestedBgColor="#f4f8fa"
                schema={schema}
                showNested={showNested}
              />
            )),
            <hr />,
          )
        : null}
    </div>
  );
}

interface PropertyDocProps {
  basepath: string;
  name: string;
  required?: boolean | undefined;
  property: Property;
  bgColor: string;
  nestedBgColor?: string | undefined;
  schema?: any;
  showNested?: boolean | undefined;
  children?: any;
}
function PropertyDoc({
  basepath,
  name,
  required,
  property,
  bgColor,
  nestedBgColor,
  schema,
  showNested,
  children,
}: PropertyDocProps) {
  const title =
    property["x-portone-title"] ||
    property.title ||
    property["x-portone-name"] ||
    "";
  const deprecated = Boolean(property.deprecated);
  return (
    <div
      class={`text-14px flex flex-col gap-2 p-2 ${
        deprecated ? "opacity-50" : ""
      }`}
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="mr-4 inline-block font-mono font-bold leading-tight">
            <span>{name}</span>
            <span class="text-slate-4 -mr-[4px]">{!required && "?"}: </span>
            <TypeReprDoc basepath={basepath} def={property} />
          </div>
          <div class="text-slate-5 inline-block text-xs">
            {title && <span>{title}</span>}
          </div>
        </div>
        <div class="text-slate-5 inline-block shrink-0 text-xs">
          {!required && <span class="inline-block">(Optional)</span>}{" "}
          {deprecated && <span class="inline-block">(Deprecated)</span>}
        </div>
      </div>
      {children}
      <DescriptionDoc
        basepath={basepath}
        typeDef={property}
        bgColor={bgColor}
        nestedBgColor={nestedBgColor}
        schema={schema}
        showNested={showNested}
      />
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
    if (typeof def !== "string" && "format" in def) {
      const format = (() => {
        switch (def.format) {
          case "int32":
            return "(32 bit)";
          case "int64":
            return "(64 bit)";
          case "date-time":
            return (
              <a
                class="underline-offset-4 hover:underline"
                target="_blank"
                href="https://datatracker.ietf.org/doc/html/rfc3339#section-5.6"
              >
                (RFC 3339 date-time)
              </a>
            );
          default:
            return "";
        }
      })();
      return (
        <span class="text-green-6 inline-block font-bold">
          {typeRepr} <span class="font-normal">{format}</span>
        </span>
      );
    }
    return <span class="text-green-6 inline-block font-bold">{typeRepr}</span>;
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
  basepath: string;
  typeDef: TypeDef | Property;
  bgColor: string;
  nestedBgColor?: string | undefined;
  schema?: any;
  showNested?: boolean | undefined;
}
function DescriptionDoc({
  basepath,
  typeDef,
  bgColor,
  nestedBgColor,
  schema,
  showNested,
}: DescriptionDocProps) {
  const description = typeDef["x-portone-description"] ?? typeDef.description;
  const summary = typeDef["x-portone-summary"] ?? typeDef.summary;
  const __html = description || summary || "";
  const unwrappedTypeDef = React.useMemo(() => {
    if (!schema || !showNested || !typeDef) return;
    return resolveTypeDef(schema, typeDef, true);
  }, [typeDef, schema, showNested]);
  return __html || unwrappedTypeDef ? (
    <DescriptionArea maxHeightPx={16 * 6} bgColor={bgColor}>
      {__html && (
        <div class="text-slate-5 flex flex-col gap-1 text-sm">
          <div dangerouslySetInnerHTML={{ __html }} />
        </div>
      )}
      {unwrappedTypeDef ? (
        <TypeDefDoc
          basepath={basepath}
          schema={schema}
          typeDef={unwrappedTypeDef}
          bgColor={nestedBgColor || bgColor}
          nestedBgColor={bgColor}
        />
      ) : null}
    </DescriptionArea>
  ) : null;
}
