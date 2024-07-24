import {
  type Accessor,
  createMemo,
  createRenderEffect,
  createSignal,
  untrack,
} from "solid-js";

import { wait } from "~/misc/async";
import { doublePushAndBack } from "~/misc/history";

const [expandedSections, setExpandedSections] = createSignal<string[]>([]);

export function useExpand(id: string, initialState: Accessor<boolean>) {
  // SSR에서도 제대로 펼쳐서 그리려면 첫 render 전에 실행될 필요가 있음
  createRenderEffect(() => {
    untrack(() => {
      expandSection(id, initialState());
    });
  });
  const expand = createMemo(() => expandedSections().includes(id));
  return {
    expand,
    onToggle: (value: boolean) => {
      expandSection(id, value);
    },
  };
}

export function expandSection(id: string, value: boolean, cb?: () => void) {
  const expandedTags = expandedSections();
  const expanded = expandedTags.includes(id);
  if (expanded === value) return cb?.();
  if (value) {
    setExpandedSections((prev) => [...prev, id]);
  } else {
    setExpandedSections((prev) => prev.filter((item) => item !== id));
  }
  cb?.();
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
  expandSection(
    section,
    true,
    () =>
      void (async () => {
        doublePushAndBack(href);
        // doublePushAndBack이 불리는 순간 스크롤이 방해받음
        // doublePushAndBack이 끝나는 시점을 특정하는 것도 불가
        await wait(100);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      })(),
  );
}
