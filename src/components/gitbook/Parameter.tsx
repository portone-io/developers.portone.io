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
  onMount,
  type ParentProps,
  Show,
  useContext,
} from "solid-js";

interface ParameterProps {
  flatten?: boolean;
  children?: JSXElement;
}

const ParameterContext = createContext({
  flatten: false,
});

export default function Parameter(props: ParameterProps) {
  return (
    <div class="text-sm text-slate-5 space-y-2">
      <ParameterContext.Provider value={{ flatten: Boolean(props.flatten) }}>
        {props.children}
      </ParameterContext.Provider>
    </div>
  );
}

interface TypeDefProps {
  ident?: JSXElement;
  optional?: boolean;
  type: JSXElement;
  children?: JSXElement;
}

const TypeDefContext = createContext({
  register: (_: string, __: () => JSXElement) => {},
  unregister: (_: string) => {},
});

Parameter.TypeDef = function TypeDef(props: TypeDefProps) {
  const { flatten } = useContext(ParameterContext);
  const details = new ReactiveMap<string, () => JSXElement>();
  const [expaneded, setExpanded] = createSignal(true);

  const detailKeyArray = createMemo(() => [...details.keys()]);
  const isFlatten = createMemo(() => flatten);
  const isExpandable = createMemo(() => details.size > 0);

  return (
    <Collapsible
      open={expaneded()}
      onOpenChange={(isOpen) => {
        if (isFlatten() === false) {
          setExpanded(isOpen);
        }
      }}
      as="div"
      class="grid grid-cols-[auto_1fr] grid-rows-[auto_auto_auto] items-center text-sm"
    >
      <Show when={isFlatten() === false}>
        <div class="col-start-1 row-start-1 h-4 w-4">
          <Show when={details.size > 0}>
            <Collapsible.Trigger as="button" class="h-4 w-4">
              <i
                class={clsx(
                  "i-ic-sharp-chevron-right inline-block h-4 w-4",
                  expaneded() && "transform-rotate-90",
                )}
              ></i>
            </Collapsible.Trigger>
          </Show>
        </div>
      </Show>
      <div class="grid col-start-2 row-start-1 row-end-3 grid-rows-subgrid">
        <div class="row-start-1 text-slate-7">
          <span class="whitespace-normal font-medium font-mono">
            {props.ident}
          </span>
          <span class="font-mono">
            {props.optional ? "?" : ""}
            {": "}
          </span>
          <span class="whitespace-normal text-green-5 font-mono">
            {props.type}
          </span>
        </div>
        <TypeDefContext.Provider
          value={{
            register: (id, el) => details.set(id, el),
            unregister: (id) => details.delete(id),
          }}
        >
          <div class="text-slate-5">{props.children}</div>
        </TypeDefContext.Provider>
      </div>
      <Show when={isExpandable()}>
        <Collapsible.Content
          as="div"
          class="grid col-start-2 row-start-3 col-end-3 mt-2 b-l"
        >
          <For each={detailKeyArray()}>
            {(key) => <>{details.get(key)?.()}</>}
          </For>
        </Collapsible.Content>
      </Show>
    </Collapsible>
  );
};

Parameter.Details = function Details(props: ParentProps) {
  const { register, unregister } = useContext(TypeDefContext);

  const uniqueId = createUniqueId();

  createEffect(() => {
    onMount(() =>
      register(uniqueId, () => <Parameter>{props.children}</Parameter>),
    );
  });
  onCleanup(() => unregister(uniqueId));

  return null;
};
