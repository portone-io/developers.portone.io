import { Collapsible } from "@kobalte/core/collapsible";
import { ReactiveSet } from "@solid-primitives/set";
import clsx from "clsx";
import {
  createContext,
  createSignal,
  createUniqueId,
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
    <div
      class={clsx(
        "text-sm text-slate-5 space-y-2",
        !props.flatten && "b-l pl-4",
      )}
    >
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
  register: (_: string) => {},
  unregister: (_: string) => {},
});

Parameter.TypeDef = function TypeDef(props: TypeDefProps) {
  const { flatten } = useContext(ParameterContext);
  const children = new ReactiveSet<string>();
  const [expaneded, setExpanded] = createSignal(true);
  return (
    <Collapsible
      open={expaneded()}
      onOpenChange={(isOpen) => {
        if (!flatten) {
          setExpanded(isOpen);
        }
      }}
      as="div"
      class="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] text-sm"
    >
      <Show when={flatten === false && children.size > 0}>
        <div class="grid items-center">
          <Collapsible.Trigger as="button" class="h-4 w-4">
            <i
              class={clsx(
                "i-ic-sharp-chevron-right inline-block h-4 w-4",
                expaneded() && "transform-rotate-90",
              )}
            ></i>
          </Collapsible.Trigger>
        </div>
      </Show>
      <div class="grid row-span-2 col-start-2 grid-rows-subgrid">
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
            register: (id: string) => children.add(id),
            unregister: (id: string) => children.delete(id),
          }}
        >
          <div class="text-slate-5">{props.children}</div>
        </TypeDefContext.Provider>
      </div>
    </Collapsible>
  );
};

Parameter.Object = function Object(props: ParentProps) {
  const { register, unregister } = useContext(TypeDefContext);

  const uniqueId = createUniqueId();

  onMount(() => register(uniqueId));
  onCleanup(() => unregister(uniqueId));

  return (
    <Collapsible.Content as={Parameter}>{props.children}</Collapsible.Content>
  );
};
