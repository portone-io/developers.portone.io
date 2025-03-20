import type { Ref } from "@solid-primitives/refs";
import { createEffect, onCleanup } from "solid-js";

export interface UseDocSearchKeyboardEventsProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onInput?: (event: KeyboardEvent) => void;
  searchButtonRef: Ref<HTMLButtonElement>;
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

export function useDocSearchKeyboardEvents(
  props: UseDocSearchKeyboardEventsProps,
): void {
  createEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (
        (event.code === "Escape" && props.isOpen) ||
        // The `Cmd+K` shortcut both opens and closes the modal.
        // We need to check for `event.key` because it can be `undefined` with
        // Chrome's autofill feature.
        // See https://github.com/paperjs/paper.js/issues/1398
        (event.key?.toLowerCase() === "k" &&
          (event.metaKey || event.ctrlKey)) ||
        // The `/` shortcut opens but doesn't close the modal because it's
        // a character.
        (!isEditingContent(event) && event.key === "/" && !props.isOpen)
      ) {
        event.preventDefault();

        if (props.isOpen) {
          props.onClose();
        } else if (!document.body.classList.contains("DocSearch--active")) {
          // We check that no other DocSearch modal is showing before opening
          // another one.
          props.onOpen();
        }

        return;
      }

      if (
        props.searchButtonRef &&
        props.searchButtonRef === document.activeElement &&
        props.onInput
      ) {
        if (/[a-zA-Z0-9]/.test(String.fromCharCode(event.keyCode))) {
          props.onInput(event);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown);
    });
  });
}
