import clsx from "clsx";
import {
  children,
  type JSXElement,
  type ParentProps,
  Suspense,
} from "solid-js";

import { ParameterHover } from "~/components/parameter/ParameterHover";
import { ParameterIdent } from "~/components/parameter/ParameterIdent";

export function ParameterRef(
  props: { content: JSXElement; class?: string } & ParentProps,
) {
  const child = children(() => props.children);

  const cls = clsx("border-b border-dotted", props.class);
  return (
    <Suspense
      fallback={
        <span class={cls}>
          <ParameterIdent>{child()}</ParameterIdent>
        </span>
      }
    >
      <ParameterHover class={cls} content={() => props.content}>
        <ParameterIdent>{child()}</ParameterIdent>
      </ParameterHover>
    </Suspense>
  );
}
