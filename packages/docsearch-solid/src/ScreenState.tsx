import type {
  AutocompleteApi,
  AutocompleteState,
  BaseItem,
} from "@algolia/autocomplete-core";
import { createMemo, Match, Switch } from "solid-js";

import type { DocSearchProps } from "./DocSearch";
import type { ErrorScreenTranslations } from "./ErrorScreen";
import { ErrorScreen } from "./ErrorScreen";
import type { NoResultsScreenTranslations } from "./NoResultsScreen";
import { NoResultsScreen } from "./NoResultsScreen";
import { ResultsScreen } from "./ResultsScreen";
import type { StartScreenTranslations } from "./StartScreen";
import { StartScreen } from "./StartScreen";
import type { StoredSearchPlugin } from "./stored-searches";
import type { InternalDocSearchHit, StoredDocSearchHit } from "./types";

export type ScreenStateTranslations = {
  errorScreen: ErrorScreenTranslations;
  startScreen: StartScreenTranslations;
  noResultsScreen: NoResultsScreenTranslations;
};

export interface ScreenStateProps<TItem extends BaseItem>
  extends AutocompleteApi<TItem> {
  state: AutocompleteState<TItem>;
  recentSearches: StoredSearchPlugin<StoredDocSearchHit>;
  favoriteSearches: StoredSearchPlugin<StoredDocSearchHit>;
  onItemClick: (
    item: InternalDocSearchHit,
    event: KeyboardEvent | MouseEvent,
  ) => void;
  inputRef: HTMLInputElement | undefined;
  hitComponent: DocSearchProps["hitComponent"];
  indexName: DocSearchProps["indexName"];
  disableUserPersonalization: boolean;
  resultsFooterComponent: DocSearchProps["resultsFooterComponent"];
  translations?: ScreenStateTranslations;
  getMissingResultsUrl?: DocSearchProps["getMissingResultsUrl"];
}

export function ScreenState(props: ScreenStateProps<InternalDocSearchHit>) {
  const hasCollections = createMemo(() => {
    return props.state.collections.some(
      (collection) => collection.items.length > 0,
    );
  });

  return (
    <Switch fallback={<ResultsScreen {...props} />}>
      <Match when={props.state.status === "error"}>
        <ErrorScreen translations={props.translations?.errorScreen} />
      </Match>
      <Match when={!props.state.query}>
        <StartScreen
          {...props}
          hasCollections={hasCollections()}
          translations={props.translations?.startScreen}
        />
      </Match>
      <Match when={!hasCollections()}>
        <NoResultsScreen
          {...props}
          translations={props.translations?.noResultsScreen}
        />
      </Match>
    </Switch>
  );
}
