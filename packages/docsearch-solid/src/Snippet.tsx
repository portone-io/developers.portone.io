import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { type StoredDocSearchHit } from "./types";

function getPropertyByPath(
  object: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split(".");

  return parts.reduce((prev: unknown, current: string) => {
    if (prev && typeof prev === "object" && current in prev) {
      return (prev as Record<string, unknown>)[current];
    }
    return null;
  }, object);
}

interface SnippetProps<TItem> {
  hit: TItem;
  attribute: string;
  tagName?: string;
  [prop: string]: unknown;
}

export function Snippet<TItem extends StoredDocSearchHit>(
  _props: SnippetProps<TItem>,
) {
  const mergedProps = mergeProps(
    {
      tagName: "span",
    },
    _props,
  );
  const [locals, others] = splitProps(mergedProps, [
    "hit",
    "attribute",
    "tagName",
  ]);

  const content = () =>
    getPropertyByPath(locals.hit, `_snippetResult.${locals.attribute}.value`) ||
    getPropertyByPath(locals.hit, locals.attribute);

  return (
    <Dynamic
      component={locals.tagName}
      {...others}
      innerHTML={String(content())}
    />
  );
}
