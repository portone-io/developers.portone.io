import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { Tabs as TabsImpl, type TabsRootProps } from "@kobalte/core/tabs";
import { ReactiveMap } from "@solid-primitives/map";
import clsx from "clsx";
import {
  createContext,
  createEffect,
  createMemo,
  For,
  type JSXElement,
  onCleanup,
  splitProps,
  untrack,
  useContext,
} from "solid-js";

const Context = createContext({
  register: (_: string, __: () => JSXElement) => {},
  deregister: (_: string) => {},
});

export default function Tabs(
  props: PolymorphicProps<"div", TabsRootProps<"div">>,
) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  const children = new ReactiveMap<string, () => JSXElement>();

  // let children register themselves with the context
  void (
    <Context.Provider
      value={{
        register: (title, el) => children.set(title, el),
        deregister: (title) => children.delete(title),
      }}
    >
      {locals.children}
    </Context.Provider>
  );

  const childrenTitles = createMemo(() => [...children.keys()]);

  return (
    <TabsImpl
      {...others}
      class={clsx("my-4 flex flex-col rounded-md", locals.class)}
      defaultValue={untrack(childrenTitles)[0]}
    >
      <TabsImpl.List class="flex -mb-px">
        <For each={childrenTitles()}>
          {(title) => (
            <TabsImpl.Trigger
              value={title}
              class={clsx(
                "border px-4 py-2 text-sm",
                "data-[selected]:(shrink-0 border-b-white bg-white z-selected-tab)",
                "[&:not([data-selected])]:(shrink overflow-hidden text-ellipsis whitespace-nowrap bg-slate-1 text-slate)",
              )}
            >
              {title}
            </TabsImpl.Trigger>
          )}
        </For>
      </TabsImpl.List>
      <For each={childrenTitles()}>
        {(title) => (
          <TabsImpl.Content
            value={title}
            class="border rounded-md rounded-tl-none px-6 py-4 [&:not([data-selected])]:hidden"
            forceMount
          >
            {children.get(title)?.()}
          </TabsImpl.Content>
        )}
      </For>
    </TabsImpl>
  );
}

Tabs.Tab = function Tab(props: { title: string; children: JSXElement }) {
  const { register, deregister } = useContext(Context);

  const title = props.title;
  register(title, () => props.children);

  createEffect(() => {
    onCleanup(() => deregister(title));
  });

  return null;
};
