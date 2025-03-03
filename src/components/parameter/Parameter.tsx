import { Collapsible } from "@kobalte/core/collapsible";
import { ReactiveMap } from "@solid-primitives/map";
import clsx from "clsx";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  type JSXElement,
  onCleanup,
  type ParentProps,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { match, P } from "ts-pattern";

import { ProseContext } from "../prose";
import { ParameterDeclaration } from "./ParameterDeclaration";
import { ParameterHover } from "./ParameterHover";
import { ParameterIdent } from "./ParameterIdent";
import { ParameterType } from "./ParameterType";

interface ParameterProps {
  class?: string;
  flatten?: boolean;
  heading?: unknown;
  children?: JSXElement;
  forceDepth?: number;
}

const ParameterContext = createContext<{
  flatten: boolean;
  forceDepth?: number;
}>({
  flatten: false,
});

const proseStyles: typeof ProseContext.defaultValue.styles = {
  h4: {
    "margin-top": "4px",
    "margin-bottom": "4px",
  },
  h5: {
    "margin-top": "4px",
    "margin-bottom": "4px",
  },
  h6: {
    "margin-top": "4px",
    "margin-bottom": "4px",
  },
  p: {
    "margin-top": "4px",
    "margin-bottom": "4px",
  },
  ul: {
    gap: "4px",
  },
};

export default function Parameter(props: ParameterProps) {
  const { forceDepth: _forceDepth } = useContext(ParameterContext);

  const forceDepth = createMemo(() => {
    if (props.forceDepth !== undefined) {
      return props.forceDepth - 1;
    }
    return _forceDepth !== undefined ? _forceDepth - 1 : undefined;
  });

  return (
    <div class={clsx("text-sm text-slate-5 space-y-3", props.class)}>
      <ProseContext.Provider value={{ styles: proseStyles }}>
        <ParameterContext.Provider
          value={{ flatten: Boolean(props.flatten), forceDepth: forceDepth() }}
        >
          {props.children}
        </ParameterContext.Provider>
      </ProseContext.Provider>
    </div>
  );
}

interface TypeDefProps {
  id?: string;
  ident?: JSXElement;
  optional?: boolean;
  // TODO: deprecated
  deprecated?: boolean;
  type: JSXElement;
  children?: JSXElement;
  defaultExpanded?: boolean;
}

const TypeDefContext = createContext({
  register: (_: string, __: () => JSXElement) => {},
  unregister: (_: string) => {},
});

Parameter.TypeDef = function TypeDef(props: TypeDefProps) {
  const { flatten, forceDepth } = useContext(ParameterContext);
  const [locals, others] = splitProps(props, ["children"]);
  const details = new ReactiveMap<string, () => JSXElement>();

  const children = (
    <TypeDefContext.Provider
      value={{
        register: (id, el) => details.set(id, el),
        unregister: (id) => details.delete(id),
      }}
    >
      {locals.children}
    </TypeDefContext.Provider>
  );

  const detailKeyArray = createMemo(() => [...details.keys()]);
  const isFlatten = createMemo(() => flatten);
  const depthLimitExceeded = createMemo(
    () => forceDepth !== undefined && forceDepth <= 0,
  );
  const isExpandable = createMemo(
    () => depthLimitExceeded() === false && details.size > 0,
  );
  const [expanded, setExpanded] = createSignal(
    match([isExpandable(), forceDepth, others.defaultExpanded])
      .with([true, undefined, P.select(P.boolean)], (expanded) => expanded)
      .with([true, undefined, undefined], () => true)
      .with([true, 1, P._], () => true)
      .with([true, P.number.gt(1), P.select(P.boolean)], (expanded) => expanded)
      .with([true, P.number.gt(1), undefined], () => true)
      .with([true, P.number, P.boolean], () => true)
      .with([true, P.number, undefined], () => false)
      .with([false, P._, P._], () => false)
      .exhaustive(),
  );

  return (
    <Collapsible
      id={others.id}
      open={expanded()}
      onOpenChange={setExpanded}
      as="div"
      class="parameter--type-def grid grid-cols-[auto_1fr] grid-rows-[auto_auto_auto] items-center text-sm"
    >
      <div
        class={clsx("col-start-1 row-start-1 h-4 w-4", isFlatten() && "-ml-4")}
      >
        <Show when={forceDepth === undefined && isExpandable()}>
          <Collapsible.Trigger as="button" class="h-4 w-4">
            <i
              class={clsx(
                "i-ic-sharp-chevron-right inline-block h-4 w-4",
                expanded() && "transform-rotate-90",
              )}
            ></i>
          </Collapsible.Trigger>
        </Show>
      </div>
      <div class="grid col-start-2 row-start-1 row-end-3 grid-rows-subgrid">
        <ParameterDeclaration
          class="row-start-1"
          ident={others.ident}
          type={others.type}
          optional={others.optional}
        />
        <div class="overflow-x-auto">{children}</div>
      </div>
      <Collapsible.Content
        as={Parameter}
        class="grid col-start-2 row-start-3 col-end-3 mt-3 b-l"
      >
        <For each={detailKeyArray()}>{(key) => details.get(key)?.()}</For>
      </Collapsible.Content>
    </Collapsible>
  );
};

Parameter.Details = function Details(props: ParentProps) {
  const { register, unregister } = useContext(TypeDefContext);

  const uniqueId = createUniqueId();

  register(uniqueId, () => props.children);
  createEffect(() => {
    onCleanup(() => unregister(uniqueId));
  });

  return null;
};

Parameter.Ident = ParameterIdent;

Parameter.Type = ParameterType;

Parameter.Declaration = ParameterDeclaration;

Parameter.Hover = ParameterHover;
