import {
  type AlgoliaInsightsHit,
  createAutocomplete,
} from "@algolia/autocomplete-core";
import { liteClient, type SearchResponse } from "algoliasearch/lite";
import {
  createEffect,
  createMemo,
  createRenderEffect,
  mergeProps,
  onCleanup,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import { MAX_QUERY_SIZE } from "./constants";
import type { DocSearchProps, DocSearchTransformClient } from "./DocSearch";
import type { FooterTranslations } from "./Footer";
import { Footer } from "./Footer";
import { Hit } from "./Hit";
import type { ScreenStateTranslations } from "./ScreenState";
import { ScreenState } from "./ScreenState";
import type { SearchBoxTranslations } from "./SearchBox";
import { SearchBox } from "./SearchBox";
import { createStoredSearches } from "./stored-searches";
import type {
  DocSearchHit,
  DocSearchState,
  InternalDocSearchHit,
  StoredDocSearchHit,
} from "./types";
import { useTouchEvents } from "./useTouchEvents";
import { useTrapFocus } from "./useTrapFocus";
import {
  groupBy,
  identity,
  isModifierEvent,
  noop,
  removeHighlightTags,
} from "./utils";
import { version } from "./version";

export type ModalTranslations = {
  searchBox: SearchBoxTranslations;
  footer: FooterTranslations;
  screenState: ScreenStateTranslations;
};

export type DocSearchModalProps = Omit<DocSearchProps, "translations"> & {
  initialScrollY: number;
  onClose?: () => void;
  translations?: ModalTranslations;
};

export function DocSearchModal(props: DocSearchModalProps) {
  const mergedProps = mergeProps(
    {
      placeholder: "Search docs",
      onClose: noop,
      transformItems: identity<DocSearchHit[]>,
      hitComponent: Hit,
      resultsFooterComponent: () => null,
      initialScrollY: 0,
      transformSearchClient: identity<DocSearchTransformClient>,
      disableUserPersonalization: false,
      initialQuery: "",
      insights: false,
    },
    props,
  );

  const [state, setState] = createStore<DocSearchState<InternalDocSearchHit>>({
    query: "",
    collections: [],
    completion: null,
    context: {},
    isOpen: false,
    activeItemId: null,
    status: "idle",
  });

  let containerRef: HTMLDivElement | undefined;
  let modalRef: HTMLDivElement | undefined;
  let formElementRef: HTMLDivElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;
  let snippetLength = 10;

  const initialQueryFromSelection =
    typeof window !== "undefined"
      ? window.getSelection()?.toString().slice(0, MAX_QUERY_SIZE) || ""
      : "";

  const initialQuery = createMemo(
    () => mergedProps.initialQuery || initialQueryFromSelection,
  );

  const client = createMemo(() => {
    const baseClient = liteClient(mergedProps.appId, mergedProps.apiKey);
    baseClient.addAlgoliaAgent("docsearch", version);

    if (
      /docsearch.js \(.*\)/.test(baseClient.transporter.algoliaAgent.value) ===
      false
    ) {
      baseClient.addAlgoliaAgent("docsearch-react", version);
    }

    return mergedProps.transformSearchClient(baseClient);
  });

  const favoriteSearches = createMemo(() =>
    createStoredSearches<StoredDocSearchHit>({
      key: `__DOCSEARCH_FAVORITE_SEARCHES__${mergedProps.indexName}`,
      limit: 10,
    }),
  );

  const recentSearches = createMemo(() =>
    createStoredSearches<StoredDocSearchHit>({
      key: `__DOCSEARCH_RECENT_SEARCHES__${mergedProps.indexName}`,
      limit: favoriteSearches().getAll().length === 0 ? 7 : 4,
    }),
  );

  function saveRecentSearch(item: InternalDocSearchHit) {
    if (mergedProps.disableUserPersonalization) {
      return;
    }

    const search = item.type === "content" ? item.__docsearch_parent : item;

    if (
      search &&
      favoriteSearches()
        .getAll()
        .findIndex((x) => x.objectID === search.objectID) === -1
    ) {
      recentSearches().add(search);
    }
  }

  function sendItemClickEvent(item: InternalDocSearchHit) {
    const ctx = state.context;
    if (!ctx.algoliaInsightsPlugin || !item.__autocomplete_id) return;

    const insightsItem = item as AlgoliaInsightsHit;

    const insightsClickParams = {
      eventName: "Item Selected",
      index: insightsItem.__autocomplete_indexName,
      items: [insightsItem],
      positions: [item.__autocomplete_id],
      queryID: insightsItem.__autocomplete_queryID,
    };

    ctx.algoliaInsightsPlugin.insights.clickedObjectIDsAfterSearch(
      insightsClickParams,
    );
  }

  const autocomplete = createMemo(() =>
    createAutocomplete<InternalDocSearchHit>({
      id: "docsearch",
      defaultActiveItemId: 0,
      placeholder: mergedProps.placeholder,
      openOnFocus: true,
      initialState: {
        query: initialQuery(),
        context: {
          searchSuggestions: [],
        },
      },
      insights: mergedProps.insights,
      navigator: mergedProps.navigator,
      onStateChange(props) {
        setState(reconcile(props.state));
      },
      getSources({ query, state: sourcesState, setContext, setStatus }) {
        if (!query) {
          if (mergedProps.disableUserPersonalization) {
            return [];
          }

          return [
            {
              sourceId: "recentSearches",
              onSelect({ item, event }): void {
                saveRecentSearch(item);

                if (!isModifierEvent(event)) {
                  mergedProps.onClose();
                }
              },
              getItemUrl({ item }): string {
                return item.url;
              },
              getItems(): InternalDocSearchHit[] {
                return recentSearches().getAll() as InternalDocSearchHit[];
              },
            },
            {
              sourceId: "favoriteSearches",
              onSelect({ item, event }): void {
                saveRecentSearch(item);

                if (!isModifierEvent(event)) {
                  mergedProps.onClose();
                }
              },
              getItemUrl({ item }): string {
                return item.url;
              },
              getItems(): InternalDocSearchHit[] {
                return favoriteSearches().getAll() as InternalDocSearchHit[];
              },
            },
          ];
        }
        const searchParams = {
          requests: [
            {
              query,
              indexName: mergedProps.indexName,
              attributesToRetrieve: [
                "hierarchy.lvl0",
                "hierarchy.lvl1",
                "hierarchy.lvl2",
                "hierarchy.lvl3",
                "hierarchy.lvl4",
                "hierarchy.lvl5",
                "hierarchy.lvl6",
                "content",
                "type",
                "url",
              ],
              attributesToSnippet: [
                `hierarchy.lvl1:${snippetLength}`,
                `hierarchy.lvl2:${snippetLength}`,
                `hierarchy.lvl3:${snippetLength}`,
                `hierarchy.lvl4:${snippetLength}`,
                `hierarchy.lvl5:${snippetLength}`,
                `hierarchy.lvl6:${snippetLength}`,
                `content:${snippetLength}`,
              ],
              snippetEllipsisText: "…",
              highlightPreTag: "<mark>",
              highlightPostTag: "</mark>",
              hitsPerPage: 20,
              clickAnalytics: Boolean(mergedProps.insights),
              ...mergedProps.searchParameters,
            },
          ],
        };

        return client()
          .search<DocSearchHit>(searchParams)
          .catch((error: Error) => {
            // The Algolia `RetryError` happens when all the servers have
            // failed, meaning that there's no chance the response comes
            // back. This is the right time to display an error.
            // See https://github.com/algolia/algoliasearch-client-javascript/blob/2ffddf59bc765cd1b664ee0346b28f00229d6e12/packages/transporter/src/errors/createRetryError.ts#L5
            if (error.name === "RetryError") {
              setStatus("error");
            }

            throw error;
          })
          .then(({ results }) => {
            const firstResult = results[0] as SearchResponse<DocSearchHit>;
            const { hits, nbHits } = firstResult;
            const sources = groupBy<DocSearchHit>(
              hits,
              (hit) => removeHighlightTags(hit),
              mergedProps.maxResultsPerGroup,
            );

            // We store the `lvl0`s to display them as search suggestions
            // in the "no results" screen.
            const searchSuggestions = sourcesState.context
              .searchSuggestions as string[];
            if (searchSuggestions.length < Object.keys(sources).length) {
              setContext({
                searchSuggestions: Object.keys(sources),
              });
            }

            setContext({ nbHits });

            let insightsParams = {};
            if (mergedProps.insights) {
              insightsParams = {
                __autocomplete_indexName: mergedProps.indexName,
                __autocomplete_queryID: firstResult.queryID,
                __autocomplete_algoliaCredentials: {
                  appId: mergedProps.appId,
                  apiKey: mergedProps.apiKey,
                },
              };
            }

            return Object.values<DocSearchHit[]>(sources).map(
              (items, index) => {
                return {
                  sourceId: `hits${index}`,
                  onSelect({ item, event }): void {
                    saveRecentSearch(item);

                    if (!isModifierEvent(event)) {
                      mergedProps.onClose();
                    }
                  },
                  getItemUrl({ item }): string {
                    return (item as DocSearchHit).url;
                  },
                  getItems(): InternalDocSearchHit[] {
                    return Object.values(
                      groupBy(
                        items,
                        (item) => item.hierarchy.lvl1,
                        mergedProps.maxResultsPerGroup,
                      ),
                    )
                      .map(mergedProps.transformItems)
                      .map((groupedHits) =>
                        groupedHits.map((item) => {
                          let parent: InternalDocSearchHit | null = null;

                          const potentialParent = groupedHits.find(
                            (siblingItem) =>
                              siblingItem.type === "lvl1" &&
                              siblingItem.hierarchy.lvl1 ===
                                item.hierarchy.lvl1,
                          ) as InternalDocSearchHit | undefined;

                          if (item.type !== "lvl1" && potentialParent) {
                            parent = potentialParent;
                          }

                          return {
                            ...item,
                            __docsearch_parent: parent,
                            ...insightsParams,
                          };
                        }),
                      )
                      .flat();
                  },
                };
              },
            );
          });
      },
    }),
  );

  createEffect(() => {
    const { getEnvironmentProps } = autocomplete();

    if (dropdownRef && formElementRef && inputRef) {
      useTouchEvents({
        getEnvironmentProps,
        panelElement: dropdownRef,
        formElement: formElementRef,
        inputElement: inputRef,
      });
    }

    if (containerRef) {
      useTrapFocus({ container: containerRef });
    }
  });

  createEffect(() => {
    document.body.classList.add("DocSearch--active");

    onCleanup(() => {
      document.body.classList.remove("DocSearch--active");
      window.scrollTo?.(0, mergedProps.initialScrollY);
    });
  });

  createRenderEffect(() => {
    const scrollBarWidth = window.innerWidth - document.body.clientWidth;
    document.body.style.marginRight = `${scrollBarWidth}px`;

    onCleanup(() => {
      document.body.style.marginRight = "0px";
    });
  });

  createEffect(() => {
    const isMobileMediaQuery = window.matchMedia("(max-width: 768px)");

    if (isMobileMediaQuery.matches) {
      snippetLength = 5;
    }
  });

  createEffect(() => {
    if (dropdownRef && state.query) {
      dropdownRef.scrollTop = 0;
    }
  });

  createEffect(() => {
    if (initialQuery().length > 0) {
      void autocomplete().refresh();

      if (inputRef) {
        inputRef.focus();
      }
    }
  });

  createEffect(() => {
    function setFullViewportHeight(): void {
      if (modalRef) {
        const vh = window.innerHeight * 0.01;
        modalRef.style.setProperty("--docsearch-vh", `${vh}px`);
      }
    }

    setFullViewportHeight();

    window.addEventListener("resize", setFullViewportHeight);

    onCleanup(() => {
      window.removeEventListener("resize", setFullViewportHeight);
    });
  });

  return (
    <div
      ref={containerRef}
      {...autocomplete().getRootProps({
        "aria-expanded": true,
      })}
      class={[
        "DocSearch",
        "DocSearch-Container",
        state.status === "stalled" && "DocSearch-Container--Stalled",
        state.status === "error" && "DocSearch-Container--Errored",
      ]
        .filter(Boolean)
        .join(" ")}
      role="button"
      tabIndex={0}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          mergedProps.onClose();
        }
      }}
    >
      <div class="DocSearch-Modal" ref={modalRef}>
        <header ref={formElementRef} class="DocSearch-SearchBar">
          <SearchBox
            {...autocomplete()}
            state={state}
            autoFocus={initialQuery().length === 0}
            inputRef={inputRef}
            isFromSelection={
              Boolean(initialQuery()) &&
              initialQuery() === initialQueryFromSelection
            }
            translations={mergedProps.translations?.searchBox}
            onClose={mergedProps.onClose}
          />
        </header>

        <div class="DocSearch-Dropdown" ref={dropdownRef}>
          <ScreenState
            {...autocomplete()}
            indexName={mergedProps.indexName}
            state={state}
            hitComponent={mergedProps.hitComponent}
            resultsFooterComponent={mergedProps.resultsFooterComponent}
            disableUserPersonalization={mergedProps.disableUserPersonalization}
            recentSearches={recentSearches()}
            favoriteSearches={favoriteSearches()}
            inputRef={inputRef}
            translations={mergedProps.translations?.screenState}
            getMissingResultsUrl={mergedProps.getMissingResultsUrl}
            onItemClick={(item, event) => {
              sendItemClickEvent(item);
              saveRecentSearch(item);
              if (!isModifierEvent(event)) {
                mergedProps.onClose();
              }
            }}
          />
        </div>

        <footer class="DocSearch-Footer">
          <Footer translations={mergedProps.translations?.footer} />
        </footer>
      </div>
    </div>
  );
}
