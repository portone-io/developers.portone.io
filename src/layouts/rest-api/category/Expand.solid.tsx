/* @jsxImportSource solid-js */

import { clsx } from "clsx";
import { type JSX, Show } from "solid-js";
import { useExpand } from "~/state/rest-api/expand-section";

export interface ExpandProps {
  section: string;
  title?: string;
  class?: string;
  initialExpand?: boolean;
  children?: JSX.Element;
}
export default function Expand(props: ExpandProps) {
  const { expand, onToggle } = useExpand(
    props.section,
    props.initialExpand ?? false,
  );

  const expandButton = () => (
    <ExpandButton
      title={props.title}
      expand={expand()}
      onClick={() => {
        onToggle(!expand());
        if (!expand()) {
          const heading = document.querySelector(`section#${props.section} h2`);
          heading?.scrollIntoView({ behavior: "smooth" });
        }
      }}
    />
  );
  return (
    <div class={clsx("flex flex-col gap-20", props.class)}>
      <Show when={expand()}>
        {expandButton()}
        {props.children}
      </Show>
      {expandButton()}
    </div>
  );
}

interface ExpandButtonProps {
  title: string | undefined;
  expand: boolean | undefined;
  onClick: () => void;
}
function ExpandButton(props: ExpandButtonProps) {
  return (
    <button type="button" class="relative w-full" onClick={props.onClick}>
      <hr class="absolute top-1/2 z-0 w-full" />
      <div
        class={clsx(
          props.expand ? "bg-slate-7 text-white" : "bg-white",
          "z-1 border-slate-3 relative inline-flex justify-center gap-2 rounded-full border py-2 pl-6 pr-4",
        )}
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
          <>
            <span>{props.title ? `${props.title} 접기` : "접기"}</span>
            <i class="i-ic-baseline-keyboard-arrow-up text-2xl" />
          </>
        </Show>
      </div>
    </button>
  );
}
