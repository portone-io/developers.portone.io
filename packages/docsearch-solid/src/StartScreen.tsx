import { mergeProps } from "solid-js";

import { RecentIcon, ResetIcon, StarIcon } from "./icons";
import { Results } from "./Results";
import type { ScreenStateProps } from "./ScreenState";
import type { InternalDocSearchHit, StoredDocSearchHit } from "./types";

export type StartScreenTranslations = {
  recentSearchesTitle: string;
  noRecentSearchesText: string;
  saveRecentSearchButtonTitle: string;
  removeRecentSearchButtonTitle: string;
  favoriteSearchesTitle: string;
  removeFavoriteSearchButtonTitle: string;
};

type StartScreenProps = Omit<
  ScreenStateProps<InternalDocSearchHit>,
  "translations"
> & {
  hasCollections: boolean;
  translations?: StartScreenTranslations;
};

export function StartScreen(props: StartScreenProps) {
  const mergedProps = mergeProps(
    {
      translations: {
        recentSearchesTitle: "Recent",
        noRecentSearchesText: "No recent searches",
        saveRecentSearchButtonTitle: "Save this search",
        removeRecentSearchButtonTitle: "Remove this search from history",
        favoriteSearchesTitle: "Favorite",
        removeFavoriteSearchButtonTitle: "Remove this search from favorites",
      },
    },
    props,
  );

  const handleFavoriteClick = (
    event: MouseEvent,
    item: StoredDocSearchHit,
    runFavoriteTransition: (callback: () => void) => void,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    runFavoriteTransition(() => {
      props.favoriteSearches.add(item);
      props.recentSearches.remove(item);
      void props.refresh();
    });
  };

  const handleRecentRemoveClick = (
    event: MouseEvent,
    item: StoredDocSearchHit,
    runDeleteTransition: (callback: () => void) => void,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    runDeleteTransition(() => {
      props.recentSearches.remove(item);
      void props.refresh();
    });
  };

  const handleFavoriteRemoveClick = (
    event: MouseEvent,
    item: StoredDocSearchHit,
    runDeleteTransition: (callback: () => void) => void,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    runDeleteTransition(() => {
      props.favoriteSearches.remove(item);
      void props.refresh();
    });
  };

  if (props.state.status === "idle" && props.hasCollections === false) {
    if (props.disableUserPersonalization) {
      return null;
    }

    return (
      <div class="DocSearch-StartScreen">
        <p class="DocSearch-Help">
          {mergedProps.translations.noRecentSearchesText}
        </p>
      </div>
    );
  }

  if (props.hasCollections === false) {
    return null;
  }

  return (
    <div class="DocSearch-Dropdown-Container">
      <Results
        {...props}
        title={mergedProps.translations.recentSearchesTitle}
        collection={props.state.collections[0]!}
        renderIcon={() => (
          <div class="DocSearch-Hit-icon">
            <RecentIcon />
          </div>
        )}
        renderAction={({
          item,
          runFavoriteTransition,
          runDeleteTransition,
        }) => (
          <>
            <div class="DocSearch-Hit-action">
              <button
                class="DocSearch-Hit-action-button"
                title={mergedProps.translations.saveRecentSearchButtonTitle}
                type="submit"
                onClick={(event) =>
                  handleFavoriteClick(event, item, runFavoriteTransition)
                }
              >
                <StarIcon />
              </button>
            </div>
            <div class="DocSearch-Hit-action">
              <button
                class="DocSearch-Hit-action-button"
                title={mergedProps.translations.removeRecentSearchButtonTitle}
                type="submit"
                onClick={(event) =>
                  handleRecentRemoveClick(event, item, runDeleteTransition)
                }
              >
                <ResetIcon />
              </button>
            </div>
          </>
        )}
      />

      <Results
        {...props}
        title={mergedProps.translations.favoriteSearchesTitle}
        collection={props.state.collections[1]!}
        renderIcon={() => (
          <div class="DocSearch-Hit-icon">
            <StarIcon />
          </div>
        )}
        renderAction={({ item, runDeleteTransition }) => (
          <div class="DocSearch-Hit-action">
            <button
              class="DocSearch-Hit-action-button"
              title={mergedProps.translations.removeFavoriteSearchButtonTitle}
              type="submit"
              onClick={(event) =>
                handleFavoriteRemoveClick(event, item, runDeleteTransition)
              }
            >
              <ResetIcon />
            </button>
          </div>
        )}
      />
    </div>
  );
}
