import { signal, useComputed } from "@preact/signals";
import * as React from "react";
import { wait } from "~/misc/async";
import { doublePushAndBack } from "~/misc/history";

export const expandedSectionsSignal = signal<string[]>([]);

let waitingExpand: (() => void) | undefined;
export function waitExpand(cb: () => void) {
  waitingExpand = cb;
}
export function expanded() {
  waitingExpand?.();
  waitingExpand = undefined;
}

export function useExpand(id: string, initialState: boolean) {
  React.useEffect(() => expandSection(id, initialState), []);
  const expandSignal = useComputed(() =>
    expandedSectionsSignal.value.includes(id)
  );
  return {
    expand: expandSignal.value,
    onToggle(value: boolean) {
      expandSection(id, value);
    },
  };
}

export function expandSection(id: string, value: boolean, cb?: () => void) {
  const expandedTags = expandedSectionsSignal.value;
  const expanded = expandedTags.includes(id);
  if (expanded === value) return cb?.();
  if (value) {
    expandedSectionsSignal.value = [...expandedTags, id];
  } else {
    expandedSectionsSignal.value = expandedTags.filter((item) => item !== id);
  }
  if (cb) waitExpand(cb);
}

export interface ExpandAndScrollToConfig {
  section: string;
  id: string;
  href: string;
}
export function expandAndScrollTo({
  section,
  id,
  href,
}: ExpandAndScrollToConfig) {
  expandSection(section, true, async () => {
    doublePushAndBack(href);
    // doublePushAndBack이 불리는 순간 스크롤이 방해받음
    // doublePushAndBack이 끝나는 시점을 특정하는 것도 불가
    await wait(100);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  });
}
