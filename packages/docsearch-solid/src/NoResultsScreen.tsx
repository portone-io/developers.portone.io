import { createMemo, For, mergeProps, Show, splitProps } from "solid-js";
import { match, P } from "ts-pattern";

import { NoResultsIcon } from "./icons";
import type { ScreenStateProps } from "./ScreenState";
import type { InternalDocSearchHit } from "./types";

export type NoResultsScreenTranslations = {
  noResultsText: string;
  suggestedQueryText: string;
  reportMissingResultsText: string;
  reportMissingResultsLinkText: string;
};

type NoResultsScreenProps = Omit<
  ScreenStateProps<InternalDocSearchHit>,
  "translations"
> & {
  translations?: NoResultsScreenTranslations;
};

export function NoResultsScreen(_props: NoResultsScreenProps) {
  const mergedProps = mergeProps(
    {
      translations: {
        noResultsText: "No results for",
        suggestedQueryText: "Try searching for",
        reportMissingResultsText: "Believe this query should return results?",
        reportMissingResultsLinkText: "Let us know.",
      },
    },
    _props,
  );
  const [locals, others] = splitProps(mergedProps, ["translations"]);
  const searchSuggestions = createMemo<string[] | undefined>(() =>
    match(others.state.context.searchSuggestions)
      .with(P.array(P.string), (searchSuggestions) =>
        searchSuggestions.slice(0, 3),
      )
      .otherwise(() => undefined),
  );
  const searchSuggestionLength = createMemo(
    () => searchSuggestions()?.length ?? 0,
  );

  return (
    <div class="DocSearch-NoResults">
      <div class="DocSearch-Screen-Icon">
        <NoResultsIcon />
      </div>
      <p class="DocSearch-Title">
        {locals.translations.noResultsText} "
        <strong>{others.state.query}</strong>"
      </p>

      <Show when={searchSuggestionLength() > 0}>
        <div class="DocSearch-NoResults-Prefill-List">
          <p class="DocSearch-Help">
            {locals.translations.suggestedQueryText}:
          </p>
          <ul>
            <For each={searchSuggestions()}>
              {(search) => (
                <li>
                  <button
                    class="DocSearch-Prefill"
                    type="button"
                    onClick={() => {
                      others.setQuery(search.toLowerCase() + " ");
                      void others.refresh();
                      others.inputRef?.focus();
                    }}
                  >
                    {search}
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      <Show when={others.getMissingResultsUrl}>
        {(getMissingResultsUrl) => (
          <p class="DocSearch-Help">
            {`${locals.translations.reportMissingResultsText} `}
            <a
              href={getMissingResultsUrl()({ query: others.state.query })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locals.translations.reportMissingResultsLinkText}
            </a>
          </p>
        )}
      </Show>
    </div>
  );
}
