import {
  createMemo,
  createSignal,
  For,
  type JSXElement,
  Match,
  mergeProps,
  Show,
  Switch,
} from "solid-js";

import * as prose from "~/components/prose";
import { expandAndScrollTo, useExpand } from "~/state/rest-api/expand-section";

import { interleave } from "..";
import DescriptionArea from "../DescriptionArea";
import type { CategoryEndpointsPair } from "../schema-utils/endpoint";
import {
  type BakedProperty,
  bakeProperties,
  crawlRefs,
  getTypeDefByRef,
  getTypeDefKind,
  getTypenameByRef,
  type Property,
  repr,
  resolveTypeDef,
  type TypeDef,
} from "../schema-utils/type-def";
import Expand from "./Expand";

export interface TypeDefinitionsProps {
  basepath: string; // e.g. "/api/rest-v1"
  initialExpand?: boolean;
  endpointGroups: CategoryEndpointsPair[];
  schema: unknown;
}
export function TypeDefinitions(props: TypeDefinitionsProps) {
  const { expand, onToggle } = useExpand(
    "type-def",
    () => !!props.initialExpand,
  );
  let headingRef: HTMLHeadingElement | undefined;
  const typeDefPropsList = createMemo(() =>
    crawlRefs(props.schema, props.endpointGroups)
      .sort()
      .map((ref) => ({
        name: getTypenameByRef(ref),
        typeDef: getTypeDefByRef(props.schema, ref),
      })),
  );

  return (
    <section id="type-def" class="flex flex-col scroll-mt-5.2rem">
      <prose.h2 ref={headingRef}>타입 정의</prose.h2>
      <div class="mt-4">
        API 요청/응답의 각 필드에서 사용되는 타입 정의들을 확인할 수 있습니다
      </div>
      <div class="grid-flow-rows grid mt-4 gap-x-4 gap-y-1 border border-slate-3 rounded-lg bg-slate-1 px-6 py-4 text-xs lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        <For each={typeDefPropsList()}>
          {(property) => {
            const href = `${props.basepath}/type-def#${property.name}`;
            return (
              <a
                class="underline-offset-4 transition-colors hover:text-orange-5 hover:underline"
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  expandAndScrollTo({
                    section: "type-def",
                    href,
                    id: property.name,
                  });
                }}
                data-norefresh
              >
                {property.name}
              </a>
            );
          }}
        </For>
      </div>
      <Expand
        class="mt-20"
        title="타입 정의"
        expand={expand()}
        onToggle={onToggle}
        onCollapse={() => {
          headingRef?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <div class="grid-flow-rows grid gap-4 lg:grid-cols-2">
          <For each={typeDefPropsList()}>
            {(property) => (
              <div class="flex flex-col gap-2">
                <prose.h3
                  id={property.name}
                  class="text-slate-6 target:text-orange-5"
                >
                  <span>{property.name}</span>
                  <span class="ml-2 text-base opacity-60">
                    {getTypeDefKind(property.typeDef)}
                  </span>
                </prose.h3>
                <TypeDefDoc
                  basepath={props.basepath}
                  schema={props.schema}
                  typeDef={property.typeDef}
                  bgColor="#f1f5f9"
                  nestedBgColor="#fcfdfe"
                />
              </div>
            )}
          </For>
        </div>
      </Expand>
    </section>
  );
}

export interface TypeDefDocProps {
  basepath: string;
  schema: unknown;
  typeDef?: TypeDef | undefined;
  showNested?: boolean | undefined;
  bgColor: string;
  nestedBgColor?: string | undefined;
}
export function TypeDefDoc(props: TypeDefDocProps) {
  const kind = createMemo(() => getTypeDefKind(props.typeDef));

  return (
    <Switch>
      <Match when={kind() === "object"}>
        <ObjectDoc
          basepath={props.basepath}
          schema={props.schema}
          typeDef={props.typeDef}
          showNested={props.showNested}
          bgColor={props.bgColor}
          nestedBgColor={props.nestedBgColor}
        />
      </Match>
      <Match when={kind() === "enum"}>
        <EnumDoc
          basepath={props.basepath}
          xPortoneEnum={props.typeDef!["x-portone-enum"]}
          bgColor={props.bgColor}
        />
      </Match>
      <Match when={kind() === "union"}>
        <UnionDoc
          basepath={props.basepath}
          schema={props.schema}
          typeDef={props.typeDef!}
          showNested={props.showNested}
          bgColor={props.bgColor}
          nestedBgColor={props.nestedBgColor}
        />
      </Match>
    </Switch>
  );
}

interface UnionDocProps {
  basepath: string;
  schema: unknown;
  typeDef: TypeDef;
  showNested?: boolean | undefined;
  bgColor: string;
  nestedBgColor?: string | undefined;
}
function UnionDoc(props: UnionDocProps) {
  const types = createMemo(() =>
    Object.keys(props.typeDef.discriminator!.mapping),
  );
  const [type, setType] = createSignal(types()[0]!);
  const selectedTypeDef = createMemo(() => {
    return getTypeDefByRef(
      props.schema,
      props.typeDef.discriminator!.mapping[type()]!,
    );
  });
  const properties = createMemo(() =>
    props.typeDef ? bakeProperties(props.schema, selectedTypeDef()) : [],
  );
  const discriminatorProperty = createMemo(
    () =>
      properties().find(
        (property) =>
          property.name === props.typeDef.discriminator!.propertyName,
      )!,
  );
  const otherProperties = createMemo(() =>
    properties().filter(
      (property) => property.name !== props.typeDef.discriminator!.propertyName,
    ),
  );
  return (
    <div class="flex flex-col gap-2">
      <div class="rounded py-1" style={{ "background-color": props.bgColor }}>
        <PropertyDoc
          basepath={props.basepath}
          name={discriminatorProperty().name}
          required={true}
          isDiscriminator
          property={discriminatorProperty()}
          bgColor={props.bgColor}
          nestedBgColor={props.nestedBgColor}
        >
          <div class="flex flex-wrap items-center gap-y-2 whitespace-pre-wrap">
            필드의 값이{" "}
            <select
              class="w-fit text-ellipsis whitespace-nowrap border border-slate-2 rounded px-2 py-1"
              value={type()}
              onChange={(e) => {
                setType(e.currentTarget.value);
              }}
            >
              <For each={types()}>
                {(type) => (
                  <option value={type}>
                    {type}
                    {props.typeDef["x-portone-discriminator"]?.[type]?.title &&
                      ` (${props.typeDef["x-portone-discriminator"][type]?.title})`}
                  </option>
                )}
              </For>
            </select>{" "}
            일 때 타입은{" "}
            <TypeReprDoc
              basepath={props.basepath}
              def={props.typeDef.discriminator!.mapping[type()]!}
            />{" "}
            입니다.
          </div>
        </PropertyDoc>
      </div>
      <For each={otherProperties()}>
        {(property) => (
          <div
            class="rounded py-1"
            style={{ "background-color": props.bgColor }}
          >
            <PropertyDoc
              basepath={props.basepath}
              name={property.name}
              required={property.required}
              property={property}
              bgColor={props.bgColor}
              nestedBgColor={props.nestedBgColor}
              schema={props.schema}
              showNested={props.showNested}
            />
          </div>
        )}
      </For>
    </div>
  );
}

interface EnumDocProps {
  basepath: string;
  xPortoneEnum: TypeDef["x-portone-enum"];
  bgColor: string;
}
function EnumDoc(props: EnumDocProps) {
  return (
    <div class="flex flex-col gap-2">
      <For each={Object.entries(props.xPortoneEnum || {})}>
        {([enumValue, enumCase]) => {
          const title = createMemo(
            () => enumCase["x-portone-title"] || enumCase.title || "",
          );
          return (
            <div
              class="flex flex-col gap-2 rounded p-2"
              style={{ "background-color": props.bgColor }}
            >
              <div class="flex items-center gap-2 leading-none">
                <code>{enumValue}</code>
                <span class="text-sm text-slate-5">{title()}</span>
              </div>
              <DescriptionDoc
                basepath={props.basepath}
                typeDef={enumCase}
                bgColor={props.bgColor}
              />
            </div>
          );
        }}
      </For>
    </div>
  );
}

interface ObjectDocProps {
  basepath: string;
  schema: unknown;
  typeDef?: TypeDef | undefined;
  showNested?: boolean | undefined;
  bgColor: string;
  nestedBgColor?: string | undefined;
}
function ObjectDoc(props: ObjectDocProps) {
  const properties = createMemo(() =>
    props.typeDef ? bakeProperties(props.schema, props.typeDef) : [],
  );
  return (
    <PropertiesDoc
      basepath={props.basepath}
      bgColor={props.bgColor}
      nestedBgColor={props.nestedBgColor}
      schema={props.schema}
      properties={properties()}
      showNested={props.showNested}
    />
  );
}

export interface PropertiesDocProps {
  basepath: string;
  properties: BakedProperty[];
  bgColor: string;
  nestedBgColor?: string | undefined;
  schema?: unknown;
  showNested?: boolean | undefined;
}
export function PropertiesDoc(props: PropertiesDocProps) {
  return (
    <div class="flex flex-col gap-2">
      <For each={props.properties}>
        {(property) => (
          <div
            class="rounded py-1"
            style={{ "background-color": props.bgColor }}
          >
            <PropertyDoc
              basepath={props.basepath}
              name={property.name}
              required={property.required}
              property={property}
              bgColor={props.bgColor}
              nestedBgColor={props.nestedBgColor}
              schema={props.schema}
              showNested={props.showNested}
            />
          </div>
        )}
      </For>
    </div>
  );
}

export interface ReqPropertiesDocProps {
  basepath: string;
  properties: BakedProperty[];
  schema?: unknown;
  showNested?: boolean | undefined;
}
export function ReqPropertiesDoc(props: ReqPropertiesDocProps) {
  return (
    <div class="flex flex-col gap-1">
      <For
        each={
          props.properties.length ? interleave(props.properties, null) : null
        }
      >
        {(property) =>
          property ? (
            <PropertyDoc
              basepath={props.basepath}
              name={property.name}
              required={property.required}
              property={property}
              bgColor="white"
              nestedBgColor="#f4f8fa"
              schema={props.schema}
              showNested={props.showNested}
            />
          ) : (
            <hr />
          )
        }
      </For>
    </div>
  );
}

interface PropertyDocProps {
  basepath: string;
  name: string;
  required?: boolean | undefined;
  isDiscriminator?: boolean | undefined;
  property: Property;
  bgColor: string;
  nestedBgColor?: string | undefined;
  schema?: unknown;
  showNested?: boolean | undefined;
  children?: JSXElement;
}
function PropertyDoc(_props: PropertyDocProps) {
  const props = mergeProps({ isDiscriminator: false }, _props);
  const title = createMemo(
    () =>
      props.property["x-portone-title"] ||
      props.property.title ||
      props.property["x-portone-name"] ||
      "",
  );
  const deprecated = createMemo(() => Boolean(props.property.deprecated));
  return (
    <div
      class="flex flex-col gap-2 p-2 text-14px"
      classList={{ "opacity-50": deprecated() }}
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="mr-4 inline-block font-bold leading-tight font-mono">
            <span>{props.name}</span>
            <span class="text-slate-4 -mr-[4px]">
              {`${!props.required ? "?" : ""}: `}
            </span>
            <TypeReprDoc basepath={props.basepath} def={props.property} />{" "}
            <Show when={props.isDiscriminator}>
              <span class="inline-block">(Union Tag)</span>
            </Show>
          </div>
          <Show when={title()}>
            <div class="inline-block text-xs text-slate-5">
              <span>{title()}</span>
            </div>
          </Show>
        </div>
        <div class="inline-block shrink-0 text-xs text-slate-5">
          <Show when={!props.required}>
            <span class="inline-block">(Optional)</span>{" "}
          </Show>
          <Show when={deprecated()}>
            <span class="inline-block">(Deprecated)</span>
          </Show>
        </div>
      </div>
      {props.children}
      <DescriptionDoc
        basepath={props.basepath}
        typeDef={props.property}
        bgColor={props.bgColor}
        nestedBgColor={props.nestedBgColor}
        schema={props.schema}
        showNested={props.showNested}
      />
    </div>
  );
}

interface TypeReprDocProps {
  basepath: string;
  def: string | TypeDef | Property;
}
function TypeReprDoc(props: TypeReprDocProps) {
  const typeRepr = createMemo(() => repr(props.def));
  const isUserType = createMemo(
    () => typeRepr()[0]?.toUpperCase() === typeRepr()[0],
  );
  const typeName = createMemo(() => typeRepr().replace("[]", ""));
  const href = createMemo(() => `${props.basepath}/type-def#${typeName()}`);
  const format = createMemo((): JSXElement => {
    if (typeof props.def === "string" || !("format" in props.def)) return null;
    switch (props.def.format) {
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
        return null;
    }
  });

  return (
    <Switch
      fallback={
        <span class="inline-block text-green-6 font-bold">
          {typeRepr()}
          <Show when={format()}>
            {(format) => <span class="font-normal"> {format()}</span>}
          </Show>
        </span>
      }
    >
      <Match when={isUserType()}>
        <a
          class="inline-block text-green-6 font-bold underline-offset-4 transition-colors hover:text-orange-5 hover:underline"
          href={href()}
          onClick={(e) => {
            e.preventDefault();
            expandAndScrollTo({
              section: "type-def",
              href: href(),
              id: typeName(),
            });
          }}
          data-norefresh
        >
          {typeRepr()}
        </a>
      </Match>
    </Switch>
  );
}

interface DescriptionDocProps {
  basepath: string;
  typeDef: TypeDef | Property;
  bgColor: string;
  nestedBgColor?: string | undefined;
  schema?: unknown;
  showNested?: boolean | undefined;
}
function DescriptionDoc(props: DescriptionDocProps) {
  const description = createMemo(
    () => props.typeDef["x-portone-description"] ?? props.typeDef.description,
  );
  const summary = createMemo(
    () => props.typeDef["x-portone-summary"] ?? props.typeDef.summary,
  );
  const html = createMemo(() => description() || summary() || "");
  const unwrappedTypeDef = createMemo(() => {
    if (!props.schema || !props.showNested || !props.typeDef) return;
    return resolveTypeDef(props.schema, props.typeDef, true);
  });

  return (
    <Show when={html() || unwrappedTypeDef()}>
      <DescriptionArea maxHeightPx={16 * 6} bgColor={props.bgColor}>
        <Show when={html()}>
          {(html) => (
            <div class="flex flex-col gap-1 text-sm text-slate-5">
              <div innerHTML={html()} />
            </div>
          )}
        </Show>
        <Show when={unwrappedTypeDef()}>
          {(typeDef) => (
            <TypeDefDoc
              basepath={props.basepath}
              schema={props.schema}
              typeDef={typeDef()}
              bgColor={props.nestedBgColor || props.bgColor}
              nestedBgColor={props.bgColor}
            />
          )}
        </Show>
      </DescriptionArea>
    </Show>
  );
}
