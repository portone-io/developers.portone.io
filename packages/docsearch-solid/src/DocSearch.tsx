import type {
  AutocompleteOptions,
  AutocompleteState,
} from "@algolia/autocomplete-core";
import type { Ref } from "@solid-primitives/refs";
import type { LiteClient, SearchParamsObject } from "algoliasearch/lite";
import {
  createEffect,
  createSignal,
  type JSXElement,
  mergeProps,
  onCleanup,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

import type { ButtonTranslations, ModalTranslations } from ".";
import { DocSearchButton } from "./DocSearchButton";
import { DocSearchModal } from "./DocSearchModal";
import type {
  DocSearchHit,
  InternalDocSearchHit,
  StoredDocSearchHit,
} from "./types";

export type DocSearchTranslations = {
  button: ButtonTranslations;
  modal: ModalTranslations;
};

// The interface that describes the minimal implementation required for the algoliasearch client, when using the [`transformSearchClient`](https://docsearch.algolia.com/docs/api/#transformsearchclient) option.
export type DocSearchTransformClient = {
  search: LiteClient["search"];
  addAlgoliaAgent: LiteClient["addAlgoliaAgent"];
  transporter: Pick<LiteClient["transporter"], "algoliaAgent">;
};

export interface DocSearchProps {
  appId: string;
  apiKey: string;
  indexName: string;
  placeholder?: string;
  searchParameters?: SearchParamsObject;
  maxResultsPerGroup?: number;
  transformItems?: (items: DocSearchHit[]) => DocSearchHit[];
  hitComponent?: (props: {
    hit: InternalDocSearchHit | StoredDocSearchHit;
    children: JSXElement;
  }) => JSXElement;
  resultsFooterComponent?: (props: {
    state: AutocompleteState<InternalDocSearchHit>;
  }) => JSXElement | null;
  transformSearchClient?: (
    searchClient: DocSearchTransformClient,
  ) => DocSearchTransformClient;
  disableUserPersonalization?: boolean;
  initialQuery?: string;
  navigator?: AutocompleteOptions<InternalDocSearchHit>["navigator"];
  translations?: DocSearchTranslations;
  getMissingResultsUrl?: ({ query }: { query: string }) => string;
  insights?: AutocompleteOptions<InternalDocSearchHit>["insights"];
}

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement;
  const tagName = element.tagName;

  return (
    element.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  );
}

export function DocSearch(props: DocSearchProps): JSXElement {
  const defaultProps = {
    initialQuery: "",
  };

  const mergedProps = mergeProps(defaultProps, props);

  let searchButtonRef: Ref<HTMLButtonElement>;
  const [isOpen, setIsOpen] = createSignal(false);
  const [initialQuery, setInitialQuery] = createSignal<string | undefined>(
    mergedProps.initialQuery,
  );

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setInitialQuery(mergedProps.initialQuery);
  };

  const onInput = (event: KeyboardEvent) => {
    setIsOpen(true);
    setInitialQuery(event.key);
  };

  createEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (
        (event.code === "Escape" && isOpen()) ||
        // The `Cmd+K` shortcut both opens and closes the modal.
        // We need to check for `event.key` because it can be `undefined` with
        // Chrome's autofill feature.
        // See https://github.com/paperjs/paper.js/issues/1398
        (event.key?.toLowerCase() === "k" &&
          (event.metaKey || event.ctrlKey)) ||
        // The `/` shortcut opens but doesn't close the modal because it's
        // a character.
        (!isEditingContent(event) && event.key === "/" && !isOpen())
      ) {
        event.preventDefault();

        if (isOpen()) {
          onClose();
        } else if (!document.body.classList.contains("DocSearch--active")) {
          // We check that no other DocSearch modal is showing before opening
          // another one.
          onOpen();
        }

        return;
      }

      if (
        searchButtonRef &&
        searchButtonRef === document.activeElement &&
        onInput
      ) {
        if (/[a-zA-Z0-9]/.test(String.fromCharCode(event.keyCode))) {
          onInput(event);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown);
    });
  });

  return (
    <>
      <DocSearchButton
        ref={searchButtonRef}
        translations={
          mergedProps.translations && mergedProps.translations.button
        }
        onClick={onOpen}
      />

      <Show when={isOpen()}>
        <Portal>
          <DocSearchModal
            {...mergedProps}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery()}
            translations={
              mergedProps.translations && mergedProps.translations.modal
            }
            onClose={onClose}
          />
        </Portal>
      </Show>
    </>
  );
}
