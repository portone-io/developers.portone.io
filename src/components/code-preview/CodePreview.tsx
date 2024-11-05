import { children, type JSXElement } from "solid-js";

import type { Tab } from "./index.js";

interface Props<Params extends object, Sections extends string> {
  children?: JSXElement;
  tabs: Tab<Params, Sections>[];
}

export function CodePreview<Params extends object, Sections extends string>(
  props: Props<Params, Sections>,
) {
  const c = children(() => props.children);
  const ref: HTMLDivElement | undefined = undefined;
  return (
    <>
      <div class="w-133">todo</div>
    </>
  );
}

export type SectionProps<Sections extends string> = {
  section: Sections;
  children: JSXElement;
};
CodePreview.Section = function Section<Sections extends string>(
  props: SectionProps<Sections>,
) {};
