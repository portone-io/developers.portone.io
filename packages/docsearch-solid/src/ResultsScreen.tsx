import { For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { SelectIcon, SourceIcon } from "./icons";
import { Results } from "./Results";
import type { ScreenStateProps } from "./ScreenState";
import type { InternalDocSearchHit } from "./types";
import { removeHighlightTags } from "./utils";

type ResultsScreenProps = Omit<
  ScreenStateProps<InternalDocSearchHit>,
  "translations"
>;

export function ResultsScreen(props: ResultsScreenProps) {
  return (
    <div class="DocSearch-Dropdown-Container">
      <For each={props.state.collections}>
        {(collection) => {
          if (collection.items.length === 0) {
            return null;
          }

          const title = removeHighlightTags(collection.items[0]!);

          return (
            <Results
              {...props}
              title={title}
              collection={collection}
              renderIcon={({ item, index }) => (
                <>
                  <Show when={item.__docsearch_parent}>
                    <svg class="DocSearch-Hit-Tree" viewBox="0 0 24 54">
                      <g
                        stroke="currentColor"
                        fill="none"
                        fill-rule="evenodd"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <Show
                          when={
                            item.__docsearch_parent !==
                            collection.items[index + 1]?.__docsearch_parent
                          }
                          fallback={<path d="M8 6v42M20 27H8.3" />}
                        >
                          <path d="M8 6v21M20 27H8.3" />
                        </Show>
                      </g>
                    </svg>
                  </Show>

                  <div class="DocSearch-Hit-icon">
                    <SourceIcon type={item.type} />
                  </div>
                </>
              )}
              renderAction={() => (
                <div class="DocSearch-Hit-action">
                  <SelectIcon />
                </div>
              )}
            />
          );
        }}
      </For>

      <Show when={props.resultsFooterComponent}>
        <section class="DocSearch-HitsFooter">
          <Dynamic
            component={props.resultsFooterComponent}
            state={props.state}
          />
        </section>
      </Show>
    </div>
  );
}
