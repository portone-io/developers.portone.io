/* @jsxImportSource solid-js */

import {
  type JSX,
  createMemo,
  createSignal,
  onMount,
  createEffect,
} from "solid-js";
import type { TypeDef } from "../../schema-utils";
import mapNullable from "~/misc/mapNullable";

interface UnionDocImplProps {
  typeDef: TypeDef;
  bgColor: string;
  discriminator?: JSX.Element;
  children: JSX.Element;
}

export default function UnionDocImpl(props: UnionDocImplProps) {
  let wrapperRef: HTMLDivElement | undefined;

  const types = createMemo(() =>
    mapNullable(props.typeDef.discriminator?.mapping, Object.keys),
  );
  const [type, setType] = createSignal(types()?.[0]);

  onMount(() => {
    wrapperRef?.querySelector("select")?.addEventListener("change", (e) => {
      setType((e.target as HTMLSelectElement).value);
      for (const el of wrapperRef?.querySelectorAll(
        "span[data-discriminator-type-repr]",
      ) ?? []) {
        const type = el.getAttribute("data-discriminator-type-repr");
        if (type === (e.target as HTMLSelectElement).value) {
          el.classList.remove("hidden");
        } else {
          el.classList.add("hidden");
        }
      }
    });
  });

  createEffect(() => {
    for (const el of wrapperRef?.querySelectorAll("[data-union-parent-type]") ??
      []) {
      const parentType = el.getAttribute("data-union-parent-type");
      if (parentType === type()) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });

  return (
    <div ref={wrapperRef as HTMLDivElement} class="flex flex-col gap-2">
      <div class="rounded py-1" style={{ "background-color": props.bgColor }}>
        {props.discriminator}
      </div>
      {props.children}
    </div>
  );
}
