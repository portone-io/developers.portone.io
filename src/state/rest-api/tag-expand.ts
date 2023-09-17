import { signal, useComputed } from "@preact/signals";
import * as React from "react";

export const expandedTagsSignal = signal<string[]>([]);

let waitingExpand: (() => void) | undefined;
export function waitExpand(cb: () => void) {
  waitingExpand = cb;
}
export function expanded() {
  waitingExpand?.();
  waitingExpand = undefined;
}

export function useExpand(id: string, initialState: boolean) {
  React.useEffect(() => expandTag(id, initialState), []);
  const expandSignal = useComputed(() => expandedTagsSignal.value.includes(id));
  return {
    expand: expandSignal.value,
    onToggle(value: boolean) {
      expandTag(id, value);
    },
  };
}

export function expandTag(id: string, value: boolean, cb?: () => void) {
  const expandedTags = expandedTagsSignal.value;
  const expanded = expandedTags.includes(id);
  if (expanded === value) return cb?.();
  if (value) {
    expandedTagsSignal.value = [...expandedTags, id];
  } else {
    expandedTagsSignal.value = expandedTags.filter((item) => item !== id);
  }
  if (cb) waitExpand(cb);
}
