/* @jsxImportSource solid-js */

import { createMemo, createSignal, onMount } from "solid-js";
import { access, type MaybeAccessor } from "@solid-primitives/utils";

export const useServerFallback = <T>(
  value: MaybeAccessor<T>,
  serverFallback: MaybeAccessor<T>,
) => {
  const [isInitialRender, setIsInitialRender] = createSignal(true);

  onMount(() => {
    setIsInitialRender(false);
  });

  return createMemo(() =>
    isInitialRender() ? access(serverFallback) : access(value),
  );
};
