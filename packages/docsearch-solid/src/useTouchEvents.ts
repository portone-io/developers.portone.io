import type { AutocompleteApi } from "@algolia/autocomplete-core";
import { onCleanup, onMount } from "solid-js";
interface UseTouchEventsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEnvironmentProps: AutocompleteApi<any>["getEnvironmentProps"];
  panelElement: HTMLDivElement | null;
  formElement: HTMLDivElement | null;
  inputElement: HTMLInputElement | null;
}

export function useTouchEvents({
  getEnvironmentProps,
  panelElement,
  formElement,
  inputElement,
}: UseTouchEventsProps): void {
  onMount(() => {
    if (!(panelElement && formElement && inputElement)) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { onTouchStart, onTouchMove } = getEnvironmentProps({
      panelElement,
      formElement,
      inputElement,
    });

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);

    onCleanup(() => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    });
  });
}
