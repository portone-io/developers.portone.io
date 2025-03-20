import type {
  AutocompleteApi,
  AutocompleteState,
  BaseItem,
} from "@algolia/autocomplete-core";
import { createMemo, createSignal, For, type JSXElement, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { DocSearchProps } from "./DocSearch";
import { Snippet } from "./Snippet";
import type { InternalDocSearchHit, StoredDocSearchHit } from "./types";

type ContentType =
  | "content"
  | "lvl0"
  | "lvl1"
  | "lvl2"
  | "lvl3"
  | "lvl4"
  | "lvl5"
  | "lvl6";

interface ResultsProps<TItem extends BaseItem> extends AutocompleteApi<TItem> {
  title: string;
  collection: AutocompleteState<TItem>["collections"][0];
  renderIcon: (props: { item: TItem; index: number }) => JSXElement;
  renderAction: (props: {
    item: TItem;
    runDeleteTransition: (cb: () => void) => void;
    runFavoriteTransition: (cb: () => void) => void;
  }) => JSXElement;
  onItemClick: (item: TItem, event: KeyboardEvent | MouseEvent) => void;
  hitComponent: DocSearchProps["hitComponent"];
}

export function Results<TItem extends StoredDocSearchHit>(
  props: ResultsProps<TItem>,
) {
  const hasCollection = createMemo(
    () => props.collection && props.collection.items.length > 0,
  );

  return (
    <Show when={hasCollection()}>
      <section class="DocSearch-Hits">
        <div class="DocSearch-Hit-source">{props.title}</div>

        <ul {...props.getListProps({ source: props.collection.source })}>
          <For each={props.collection.items}>
            {(item, index) => <Result item={item} index={index()} {...props} />}
          </For>
        </ul>
      </section>
    </Show>
  );
}

interface ResultProps<TItem extends BaseItem> extends ResultsProps<TItem> {
  item: TItem;
  index: number;
}

function Result<TItem extends StoredDocSearchHit>(
  props: ResultProps<TItem>,
): JSXElement {
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [isFavoriting, setIsFavoriting] = createSignal(false);
  const [actionCallback, setActionCallback] = createSignal<(() => void) | null>(
    null,
  );

  function runDeleteTransition(cb: () => void): void {
    setIsDeleting(true);
    setActionCallback(() => cb);
  }

  function runFavoriteTransition(cb: () => void): void {
    setIsFavoriting(true);
    setActionCallback(() => cb);
  }

  const handleTransitionEnd = createMemo(() => {
    const callback = actionCallback();
    if (callback) {
      callback();
    }
  });

  const getClassNames = createMemo(() => {
    return [
      "DocSearch-Hit",
      (props.item as unknown as InternalDocSearchHit).__docsearch_parent &&
        "DocSearch-Hit--Child",
      isDeleting() && "DocSearch-Hit--deleting",
      isFavoriting() && "DocSearch-Hit--favoriting",
    ]
      .filter(Boolean)
      .join(" ");
  });

  const isLvl1 = createMemo(() => {
    const type = props.item.type as ContentType;
    return type === "lvl1" && props.item.hierarchy[type];
  });

  const isOtherLevel = createMemo(() => {
    const type = props.item.type as ContentType;
    return (
      (type === "lvl2" ||
        type === "lvl3" ||
        type === "lvl4" ||
        type === "lvl5" ||
        type === "lvl6") &&
      props.item.hierarchy[type]
    );
  });

  const isContent = createMemo(() => props.item.type === "content");

  return (
    <li
      class={getClassNames()}
      onTransitionEnd={handleTransitionEnd}
      {...props.getItemProps({
        item: props.item,
        source: props.collection.source,
        onClick(event: MouseEvent) {
          props.onItemClick(props.item, event);
        },
      })}
    >
      <Dynamic component={props.hitComponent} hit={props.item}>
        <div class="DocSearch-Hit-Container">
          {props.renderIcon({ item: props.item, index: props.index })}

          <Show when={isLvl1()}>
            <div class="DocSearch-Hit-content-wrapper">
              <Snippet
                class="DocSearch-Hit-title"
                hit={props.item}
                attribute="hierarchy.lvl1"
              />
              <Show when={props.item.content}>
                <Snippet
                  class="DocSearch-Hit-path"
                  hit={props.item}
                  attribute="content"
                />
              </Show>
            </div>
          </Show>

          <Show when={isOtherLevel()}>
            <div class="DocSearch-Hit-content-wrapper">
              <Snippet
                class="DocSearch-Hit-title"
                hit={props.item}
                attribute={`hierarchy.${props.item.type}`}
              />
              <Snippet
                class="DocSearch-Hit-path"
                hit={props.item}
                attribute="hierarchy.lvl1"
              />
            </div>
          </Show>

          <Show when={isContent()}>
            <div class="DocSearch-Hit-content-wrapper">
              <Snippet
                class="DocSearch-Hit-title"
                hit={props.item}
                attribute="content"
              />
              <Snippet
                class="DocSearch-Hit-path"
                hit={props.item}
                attribute="hierarchy.lvl1"
              />
            </div>
          </Show>

          {props.renderAction({
            item: props.item,
            runDeleteTransition,
            runFavoriteTransition,
          })}
        </div>
      </Dynamic>
    </li>
  );
}
