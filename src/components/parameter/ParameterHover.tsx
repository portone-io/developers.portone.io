import { HoverCard } from "@kobalte/core/hover-card";
import clsx from "clsx";
import type { JSXElement, ParentProps } from "solid-js";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  useContext,
} from "solid-js";

import Parameter from "./Parameter";
interface ParameterHoverContextValue {
  nested: () => boolean;
  register: () => void;
  unregister: () => void;
}

const ParameterHoverContext = createContext<ParameterHoverContextValue>({
  nested: () => false,
  register: () => {},
  unregister: () => {},
});

type ParameterHoverProps = {
  class?: string;
  content: JSXElement;
} & ParentProps;

export function ParameterHover(props: ParameterHoverProps) {
  const parentContext = useContext(ParameterHoverContext);

  const [isOpen, setIsOpen] = createSignal(false);
  const [nested, setNested] = createSignal(false);
  const hoverCardOpen = createMemo(() => nested() || isOpen());

  createEffect(
    on(hoverCardOpen, (open) => {
      if (open) {
        parentContext.register();
      } else {
        parentContext.unregister();
      }
    }),
  );

  const register = () => {
    setNested(true);
  };

  const unregister = () => {
    setNested(false);
  };

  const contextValue: ParameterHoverContextValue = {
    nested: () => nested(),
    register,
    unregister,
  };

  const handleOpenChange = (open: boolean) => {
    if (nested()) {
      return;
    }
    setIsOpen(open);
  };

  return (
    <ParameterHoverContext.Provider value={contextValue}>
      <HoverCard
        placement="top-start"
        open={hoverCardOpen()}
        onOpenChange={handleOpenChange}
        openDelay={300}
        closeDelay={300}
      >
        <HoverCard.Trigger
          as="span"
          class={clsx(
            "justify-self-start data-[expanded]:bg-blue-1",
            props.class,
          )}
        >
          {props.children}
        </HoverCard.Trigger>
        <HoverCard.Portal mount={document.querySelector("article")!}>
          <HoverCard.Content class="grid max-h-xs max-w-sm overflow-auto border rounded-md bg-white p-4 shadow-sm z-parameter-hover [&::-webkit-scrollbar]:hidden">
            <Parameter flatten forceDepth={2}>
              {props.content}
            </Parameter>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard>
    </ParameterHoverContext.Provider>
  );
}
