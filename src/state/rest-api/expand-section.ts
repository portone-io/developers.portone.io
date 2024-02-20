import { createMemo, createRenderEffect, createSignal } from "solid-js";
import { wait } from "~/misc/async";
import { doublePushAndBack } from "~/misc/history";

export const [expandedSections, setExpandedSections] = createSignal<string[]>(
  [],
);

export function useExpand(id: string, initialState: boolean) {
  createRenderEffect(() => {
    expandSection(id, initialState);
  });
  const expand = createMemo(() => expandedSections().includes(id));
  return {
    expand,
    onToggle(value: boolean) {
      expandSection(id, value);
    },
  };
}

export function expandSection(id: string, value: boolean, cb?: () => void) {
  setExpandedSections((expandedTags) => {
    const expanded = expandedTags.includes(id);
    if (expanded === value) return expandedTags;
    return value
      ? [...expandedTags, id]
      : expandedTags.filter((item) => item !== id);
  });
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
  expandSection(section, true, async () => {
    doublePushAndBack(href);
    // doublePushAndBack이 불리는 순간 스크롤이 방해받음
    // doublePushAndBack이 끝나는 시점을 특정하는 것도 불가
    await wait(100);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  });
}
