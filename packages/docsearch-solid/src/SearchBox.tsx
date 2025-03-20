import type {
  AutocompleteApi,
  AutocompleteState,
} from "@algolia/autocomplete-core";
import { mergeRefs, Ref } from "@solid-primitives/refs";
import { createEffect, createMemo, mergeProps, splitProps } from "solid-js";

import { MAX_QUERY_SIZE } from "./constants";
import { LoadingIcon } from "./icons/LoadingIcon";
import { ResetIcon } from "./icons/ResetIcon";
import { SearchIcon } from "./icons/SearchIcon";
import type { InternalDocSearchHit } from "./types";

export type SearchBoxTranslations = {
  resetButtonTitle: string;
  resetButtonAriaLabel: string;
  cancelButtonText: string;
  cancelButtonAriaLabel: string;
  searchInputLabel: string;
};

interface SearchBoxProps extends AutocompleteApi<InternalDocSearchHit> {
  state: AutocompleteState<InternalDocSearchHit>;
  autoFocus: boolean;
  inputRef: Ref<HTMLInputElement>;
  onClose: () => void;
  isFromSelection: boolean;
  translations?: SearchBoxTranslations;
}

export function SearchBox(props: SearchBoxProps) {
  const mergedProps = mergeProps(
    {
      translations: {
        resetButtonTitle: "Clear the query",
        resetButtonAriaLabel: "Clear the query",
        cancelButtonText: "Cancel",
        cancelButtonAriaLabel: "Cancel",
        searchInputLabel: "Search",
      },
    },
    props,
  );
  const [local, restProps] = splitProps(mergedProps, [
    "translations",
    "autoFocus",
    "inputRef",
    "isFromSelection",
    "onClose",
  ]);

  let inputRef: HTMLInputElement | undefined;

  const onReset = createMemo(() =>
    restProps
      .getFormProps({
        inputElement: inputRef ?? null,
      })
      .onReset.bind(undefined),
  );

  createEffect(() => {
    if (local.autoFocus && inputRef) {
      inputRef.focus();
    }
  });

  createEffect(() => {
    if (local.isFromSelection && inputRef) {
      inputRef.select();
    }
  });

  return (
    <>
      <form
        class="DocSearch-Form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
        onReset={onReset()}
      >
        <label class="DocSearch-MagnifierLabel" {...restProps.getLabelProps()}>
          <SearchIcon />
          <span class="DocSearch-VisuallyHiddenForAccessibility">
            {mergedProps.translations.searchInputLabel}
          </span>
        </label>

        <div class="DocSearch-LoadingIndicator">
          <LoadingIcon />
        </div>

        <input
          class="DocSearch-Input"
          ref={mergeRefs(local.inputRef, (el) => (inputRef = el))}
          {...restProps.getInputProps({
            inputElement: inputRef ?? null,
            autoFocus: local.autoFocus,
            maxLength: MAX_QUERY_SIZE,
          })}
        />

        <button
          type="reset"
          title={mergedProps.translations.resetButtonTitle}
          class="DocSearch-Reset"
          aria-label={mergedProps.translations.resetButtonAriaLabel}
          hidden={!restProps.state.query}
        >
          <ResetIcon />
        </button>
      </form>

      <button
        class="DocSearch-Cancel"
        type="reset"
        aria-label={mergedProps.translations.cancelButtonAriaLabel}
        onClick={local.onClose}
      >
        {mergedProps.translations.cancelButtonText}
      </button>
    </>
  );
}
