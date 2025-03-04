import {
  createMemo,
  For,
  type JSXElement,
  Match,
  mergeProps,
  on,
  Show,
  Switch,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { match, P } from "ts-pattern";

import Parameter from "~/components/parameter/Parameter";
import { prose } from "~/components/prose";
import { toMDXModule } from "~/misc/md";
import { expandAndScrollTo, useExpand } from "~/state/rest-api/expand-section";

import { interleave } from "..";
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
              <Parameter flatten id={property.name}>
                <PropertyDoc
                  basepath={props.basepath}
                  schema={props.schema}
                  name={property.name}
                  property={property.typeDef}
                  showNested={1}
                  required
                />
              </Parameter>
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
  showNested?: boolean | number | undefined;
  ident?: string;
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
        />
      </Match>
      <Match when={kind() === "enum"}>
        <EnumDoc
          basepath={props.basepath}
          enum={props.typeDef!["enum"]}
          xPortoneEnum={props.typeDef!["x-portone-enum"]}
        />
      </Match>
      <Match when={kind() === "union"}>
        <UnionDoc
          basepath={props.basepath}
          schema={props.schema}
          typeDef={props.typeDef!}
          showNested={props.showNested}
        />
      </Match>
    </Switch>
  );
}

interface UnionDocProps {
  basepath: string;
  schema: unknown;
  typeDef: TypeDef;
  showNested?: boolean | number | undefined;
}
function UnionDoc(props: UnionDocProps) {
  const discriminator = createMemo(() => props.typeDef.discriminator!);
  return (
    <For each={Object.entries(discriminator().mapping)}>
      {([discriminateValue, _typeDef]) => {
        const typeDef = createMemo(() => {
          const typeDef = getTypeDefByRef(props.schema, _typeDef);
          return typeDef;
        });
        const properties = createMemo(() =>
          bakeProperties(props.schema, typeDef()),
        );
        const otherProperties = createMemo(() =>
          properties().filter(
            (property) => property.name !== discriminator().propertyName,
          ),
        );
        return (
          <Parameter.TypeDef
            type={
              <TypeReprDoc
                schema={props.schema}
                basepath={props.basepath}
                def={_typeDef}
              />
            }
            defaultExpanded={false}
          >
            <prose.p>
              <code>{discriminator().propertyName}</code>
              {"이(가)"}
              <code>"{discriminateValue}"</code>
              {"일 때의 타입"}
            </prose.p>
            <DescriptionDoc typeDef={typeDef()} />
            <Parameter.Details>
              <Parameter.TypeDef
                ident={discriminator().propertyName}
                type={<Parameter.Type>"{discriminateValue}"</Parameter.Type>}
              />
              <PropertiesDoc
                basepath={props.basepath}
                schema={props.schema}
                properties={otherProperties()}
                showNested={props.showNested}
              />
            </Parameter.Details>
          </Parameter.TypeDef>
        );
      }}
    </For>
  );
}

interface EnumDocProps {
  basepath: string;
  enum: TypeDef["enum"];
  xPortoneEnum: TypeDef["x-portone-enum"];
}
function EnumDoc(props: EnumDocProps) {
  const xPortoneEnum = createMemo(() => props.xPortoneEnum || {});
  return (
    <For each={props.enum}>
      {(enumValue) => {
        const enumCase = createMemo(
          () => xPortoneEnum()[enumValue] || { title: "" },
        );
        const title = createMemo(
          () => enumCase()["x-portone-title"] || enumCase().title || "",
        );
        return (
          <Parameter.TypeDef
            type={<Parameter.Type>"{enumValue}"</Parameter.Type>}
            defaultExpanded={false}
          >
            <prose.p>{title()}</prose.p>
            <DescriptionDoc typeDef={enumCase()} />
          </Parameter.TypeDef>
        );
      }}
    </For>
  );
}

interface ObjectDocProps {
  basepath: string;
  schema: unknown;
  typeDef?: TypeDef | undefined;
  showNested?: boolean | number;
}
function ObjectDoc(props: ObjectDocProps) {
  const properties = createMemo(() =>
    props.typeDef ? bakeProperties(props.schema, props.typeDef) : [],
  );
  return (
    <PropertiesDoc
      basepath={props.basepath}
      schema={props.schema}
      properties={properties()}
      showNested={props.showNested}
    />
  );
}

export interface PropertiesDocProps {
  basepath: string;
  properties: BakedProperty[];
  schema?: unknown;
  showNested?: boolean | number | undefined;
}
export function PropertiesDoc(props: PropertiesDocProps) {
  return (
    <For each={props.properties}>
      {(property) => (
        <PropertyDoc
          basepath={props.basepath}
          name={property.name}
          required={property.required}
          property={property}
          schema={props.schema}
          showNested={props.showNested}
        />
      )}
    </For>
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
    <For
      each={props.properties.length ? interleave(props.properties, null) : null}
    >
      {(property) =>
        property && (
          <PropertyDoc
            basepath={props.basepath}
            name={property.name}
            required={property.required}
            property={property}
            schema={props.schema}
            showNested={props.showNested}
          />
        )
      }
    </For>
  );
}

interface PropertyDocProps {
  basepath: string;
  name: string;
  required?: boolean | undefined;
  isDiscriminator?: boolean | undefined;
  property: Property;
  schema?: unknown;
  showNested?: boolean | number | undefined;
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
  const unwrappedTypeDef = createMemo(() => {
    if (!props.schema || !props.showNested || !props.property) return;
    return resolveTypeDef(props.schema, props.property, true);
  });
  return (
    <Parameter.TypeDef
      ident={props.name}
      optional={!props.required}
      deprecated={deprecated()}
      defaultExpanded={false}
      type={
        <>
          <TypeReprDoc
            schema={props.schema}
            basepath={props.basepath}
            def={props.property}
          />
          <Show when={props.isDiscriminator}>
            <span class="inline-block">(Union Tag)</span>
          </Show>
        </>
      }
    >
      <Show when={title()}>
        <strong>{title()}</strong>
      </Show>
      {props.children}
      <DescriptionDoc typeDef={props.property} />
      <Show when={unwrappedTypeDef()}>
        {(typeDef) => {
          const showNested = createMemo(() =>
            match(props.showNested)
              .with(undefined, () => undefined)
              .with(P.number.lte(1), () => false)
              .with(P.number, (n) => n - 1)
              .with(P.boolean, (b) => b)
              .exhaustive(),
          );
          const hasDetails = createMemo(() =>
            match(getTypeDefKind(typeDef()))
              .with("object", () => true)
              .with("union", () => true)
              .with("enum", () => true)
              .with("primitive", () => false)
              .exhaustive(),
          );
          return (
            <Show when={hasDetails()}>
              <Parameter.Details>
                <TypeDefDoc
                  basepath={props.basepath}
                  schema={props.schema}
                  typeDef={typeDef()}
                  showNested={showNested()}
                />
              </Parameter.Details>
            </Show>
          );
        }}
      </Show>
    </Parameter.TypeDef>
  );
}

interface TypeReprDocProps {
  schema?: unknown;
  basepath: string;
  def: string | TypeDef | Property;
}
function TypeReprDoc(props: TypeReprDocProps) {
  const typeRepr = createMemo(() => repr(props.def));
  const typeDef = createMemo(() =>
    typeof props.def === "string"
      ? getTypeDefByRef(props.schema, props.def)
      : typeof props.def.items === "string"
        ? props.def.items
        : resolveTypeDef(props.schema, props.def, true),
  );
  const isUserType = createMemo(
    () => typeRepr()[0]?.toUpperCase() === typeRepr()[0],
  );
  const typeName = createMemo(() => typeRepr().replace("[]", ""));
  const href = createMemo(() => `${props.basepath}/type-def#${typeName()}`);
  const format = createMemo(
    on(typeDef, (typeDef): JSXElement => {
      if (typeof typeDef === "string" || !("format" in typeDef)) return null;
      switch (typeDef.format) {
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
    }),
  );

  return (
    <Switch
      fallback={
        <Parameter.Type>
          {typeRepr()}
          <Show when={format()}>
            {(format) => <span class="font-normal"> {format()}</span>}
          </Show>
        </Parameter.Type>
      }
    >
      <Match when={typeRepr() === "_union"}>
        <UnionReprDoc
          schema={props.schema}
          basepath={props.basepath}
          typeDef={typeDef() as TypeDef}
        />
      </Match>
      <Match when={typeRepr() === "object"}>
        <ObjectReprDoc
          schema={props.schema}
          basepath={props.basepath}
          typeDef={typeDef() as TypeDef}
        />
      </Match>
      <Match when={typeRepr() === "_array"}>
        <ArrayReprDoc
          schema={props.schema}
          basepath={props.basepath}
          typeDef={
            typeof props.def === "object" &&
            typeof props.def.items === "object" &&
            props.def.items?.$ref
              ? props.def.items?.$ref
              : typeDef()
          }
        />
      </Match>
      <Match when={typeRepr() === "_enum"}>
        <EnumReprDoc
          schema={props.schema}
          basepath={props.basepath}
          typeDef={typeDef() as TypeDef}
        />
      </Match>
      <Match when={isUserType()}>
        <Parameter.Hover
          content={() => (
            <Parameter.TypeDef
              type={
                <Parameter.Type>
                  <span class="text-purple-5">{typeRepr()}</span>
                </Parameter.Type>
              }
            >
              <Show when={typeof typeDef() === "object"}>
                <DescriptionDoc typeDef={typeDef() as TypeDef} />
                <Parameter.Details>
                  <TypeDefDoc
                    basepath={props.basepath}
                    schema={props.schema}
                    typeDef={typeDef() as TypeDef}
                  />
                </Parameter.Details>
              </Show>
            </Parameter.TypeDef>
          )}
        >
          <Parameter.Type>
            <a
              class="inline-block text-purple-5 underline-offset-4 transition-colors hover:text-portone hover:underline"
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
          </Parameter.Type>
        </Parameter.Hover>
      </Match>
    </Switch>
  );
}

interface UnionReprDocProps {
  schema?: unknown;
  basepath: string;
  typeDef: TypeDef;
}
function UnionReprDoc(props: UnionReprDocProps) {
  const unionEntries = createMemo(() =>
    Object.entries(props.typeDef.discriminator!.mapping),
  );
  const isUnionEntryOverThreshold = createMemo(() => unionEntries().length > 3);
  const entries = createMemo(() =>
    isUnionEntryOverThreshold() ? unionEntries().slice(0, 3) : unionEntries(),
  );

  return (
    <Parameter.Type>
      <For each={entries()}>
        {([, typeDef], index) => (
          <Parameter.Type>
            {index() > 0 && <span class="text-slate-5"> | </span>}
            <TypeReprDoc
              schema={props.schema}
              basepath={props.basepath}
              def={typeDef}
            />
          </Parameter.Type>
        )}
      </For>
      {isUnionEntryOverThreshold() && <span class="text-slate-5"> | ...</span>}
    </Parameter.Type>
  );
}

interface ObjectReprDocProps {
  schema?: unknown;
  basepath: string;
  typeDef: TypeDef;
}
function ObjectReprDoc(props: ObjectReprDocProps) {
  const properties = createMemo(() =>
    bakeProperties(props.schema, props.typeDef),
  );

  const isPropertiesOverThreshold = createMemo(() => properties().length > 3);
  const displayProperties = createMemo(() =>
    isPropertiesOverThreshold() ? properties().slice(0, 3) : properties(),
  );

  return (
    <Parameter.Type>
      <span class="text-purple-5">{"{ "}</span>
      <For each={displayProperties()}>
        {(property, index) => (
          <>
            {index() > 0 && <span class="text-purple-5">, </span>}
            <span class="text-purple-5">{property.name}</span>
          </>
        )}
      </For>
      {isPropertiesOverThreshold() && <span class="text-purple-5">, ...</span>}
      <span class="text-purple-5">{" }"}</span>
    </Parameter.Type>
  );
}

interface ArrayReprDocProps {
  schema?: unknown;
  basepath: string;
  typeDef: string | TypeDef;
}
function ArrayReprDoc(props: ArrayReprDocProps) {
  return (
    <Parameter.Type>
      <span class="text-purple-5">Array</span>
      <span class="text-slate-5">{"<"}</span>
      <TypeReprDoc
        schema={props.schema}
        basepath={props.basepath}
        def={props.typeDef}
      />
      <span class="text-slate-5">{">"}</span>
    </Parameter.Type>
  );
}

interface EnumReprDocProps {
  schema?: unknown;
  basepath: string;
  typeDef: TypeDef;
}
function EnumReprDoc(props: EnumReprDocProps) {
  const enumValues = createMemo(() => props.typeDef.enum || []);
  const isEnumOverThreshold = createMemo(() => enumValues().length > 3);
  const displayValues = createMemo(() =>
    isEnumOverThreshold() ? enumValues().slice(0, 3) : enumValues(),
  );

  return (
    <Parameter.Type>
      <For each={displayValues()}>
        {(enumValue, index) => (
          <>
            {index() > 0 && <span class="text-slate-5"> | </span>}
            <span>"{enumValue}"</span>
          </>
        )}
      </For>
      {isEnumOverThreshold() && <span class="text-slate-5"> | ...</span>}
    </Parameter.Type>
  );
}

interface DescriptionDocProps {
  typeDef: TypeDef | Property;
}
function DescriptionDoc(props: DescriptionDocProps) {
  const rawDescription = createMemo(
    () => props.typeDef["x-portone-description"] ?? props.typeDef.description,
  );
  const description = createMemo(() => {
    const markdown = rawDescription();
    return markdown == null ? markdown : toMDXModule(markdown);
  });
  const summary = createMemo(
    () => props.typeDef["x-portone-summary"] ?? props.typeDef.summary,
  );

  return (
    <Switch>
      <Match when={description()}>
        {(description) => <Dynamic component={description()} />}
      </Match>
      <Match when={summary()}>
        <prose.p>{summary()}</prose.p>
      </Match>
    </Switch>
  );
}
