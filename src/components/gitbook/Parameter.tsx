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
  useContext,
} from "solid-js";

interface ParameterProps {
  children?: JSXElement;
}

export default function Parameter(props: ParameterProps) {
  return (
    <div class="ml-1 b-l pl-4.5 text-sm text-slate-5 space-y-2">
      {props.children}
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
  const children = new ReactiveSet<string>();
  const [expaneded, setExpanded] = createSignal(true);
  return (
    <Collapsible
      open={expaneded()}
      onOpenChange={setExpanded}
      as="div"
      class="text-sm"
    >
      <div class="h-0 w-0">
        <Collapsible.Trigger
          as="button"
          class={clsx(
            "h-4 w-4 bg-white p-.5 -ml-7",
            children.size > 0 ? "block" : "hidden",
          )}
        >
          <i
            class={clsx(
              "i-ic-sharp-chevron-right inline-block h-4 w-4",
              expaneded() && "transform-rotate-90",
            )}
          ></i>
        </Collapsible.Trigger>
      </div>
      <div class="cursor-default text-slate-7">
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
