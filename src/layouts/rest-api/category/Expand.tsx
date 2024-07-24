import clsx from "clsx";
import { type JSXElement, mergeProps, Show } from "solid-js";

export interface ExpandProps {
  title?: string;
  class?: string;
  children?: JSXElement;
  expand?: boolean;
  onToggle?: (expand: boolean) => void;
  onCollapse?: () => void;
}
export default function Expand(_props: ExpandProps) {
  const props = mergeProps({ title: "" }, _props);
  const expandButton = () => (
    <ExpandButton
      title={props.title}
      expand={props.expand}
      onClick={() => {
        props.onToggle?.(!props.expand);
        if (props.expand) props.onCollapse?.();
      }}
    />
  );
  return (
    <div class={clsx("flex flex-col gap-20", props.class)}>
      <Show when={props.expand}>
        {expandButton()}
        {props.children}
      </Show>
      {expandButton()}
    </div>
  );
}

interface ExpandButtonProps {
  title: string;
  expand?: boolean | undefined;
  onClick?: () => void;
}
function ExpandButton(props: ExpandButtonProps) {
  return (
    <button class="relative w-full" onClick={props.onClick}>
      <hr class="absolute top-1/2 w-full" />
      <div
        class="relative inline-flex justify-center gap-2 border border-slate-3 rounded-full py-2 pl-6 pr-4"
        classList={{
          "bg-slate-7": props.expand,
          "text-white": props.expand,
          "bg-white": !props.expand,
        }}
      >
        <Show
          when={props.expand}
          fallback={
            <>
              <span>{props.title ? `${props.title} 펼치기` : "펼치기"}</span>
              <i class="i-ic-baseline-keyboard-arrow-down text-2xl" />
            </>
          }
        >
          <span>{props.title ? `${props.title} 접기` : "접기"}</span>
          <i class="i-ic-baseline-keyboard-arrow-up text-2xl" />
        </Show>
      </div>
    </button>
  );
}
