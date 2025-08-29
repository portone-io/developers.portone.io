import clsx from "clsx";
import {
  type Accessor,
  createEffect,
  createSignal,
  For,
  type JSXElement,
  onCleanup,
  Show,
  untrack,
} from "solid-js";

import type { Heading } from "~/genCollections";
import { useSystemVersion } from "~/state/system-version";

interface Props {
  children?: JSXElement;
  theme: "aside" | "island";
  headings: Heading[];
}

function useActiveId(
  headings: Accessor<Heading[]>,
  childActiveId: Accessor<string | null> = () => null,
) {
  const [activeId, setActiveId] = createSignal(headings()[0]?.id ?? null);

  createEffect(() => {
    setActiveId(headings()[0]?.id ?? null);
  });

  createEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const currentHeadings = untrack(headings);
        const intersectingEntry = entries.findLast(
          (entry) => entry.isIntersecting,
        );
        // 신규 진입 entry가 있을 경우 해당 entry를 활성 entry로 설정
        if (intersectingEntry) {
          setActiveId(intersectingEntry.target.id);
          return;
        }

        // 마지막으로 active였던 entry가 화면에서 사라지는 경우 처리
        const currentEntry = entries.find(
          (entry) => entry.target.id === untrack(activeId),
        );
        if (!currentEntry) return;

        const currentItem = currentHeadings.find(
          (item) => item.id === currentEntry.target.id,
        );

        // 마지막으로 active였던 entry가 화면에서 사라지는데 하위 entry가 활성화되어 있지 않은 경우
        if (
          !currentEntry.isIntersecting &&
          (!childActiveId ||
            !currentItem?.children.some(
              (item) => item.id === untrack(childActiveId),
            ))
        ) {
          // entry가 화면보다 위쪽에 있는지
          const atTop =
            (currentEntry.rootBounds?.top ?? 0) >
            currentEntry.boundingClientRect.bottom;
          // entry가 화면보다 아래에 있다 = 사용자는 entry 위쪽의 컨텐츠에 진입했다
          if (!atTop) {
            // 즉 현재 entry 위쪽에 그려진 entry가 활성 entry가 되어야 한다
            const prevItem =
              currentHeadings[
                currentHeadings.findIndex(
                  (item) => item.id === untrack(activeId),
                ) - 1
              ];
            if (prevItem) setActiveId(prevItem.id);
            // 현재 entry가 현 depth에서 최상단 entry라면 activeId를 null로 설정
            else setActiveId(null);
          }
        }
      },
      { rootMargin: "-40% 0px", threshold: 0.00001 },
    );
    for (const item of headings()) {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
      }
    }
    onCleanup(() => {
      observer.disconnect();
    });
  });

  return activeId;
}

export default function TableOfContents(props: Props) {
  const [childActiveId, setChildActiveId] = createSignal<string | null>(null);
  const [headings, setHeadings] = createSignal<Heading[]>([]);
  const activeId = useActiveId(headings, childActiveId);
  const { systemVersion } = useSystemVersion();

  createEffect(() => {
    void systemVersion();
    setHeadings(
      filterHeadingsById(
        props.headings,
        [...document.querySelectorAll("article :is(h2, h3)")].map((h) => h.id),
      ),
    );
  });

  return (
    <ul class="m-0 flex flex-col list-none gap-1 p-0">
      <For each={headings()}>
        {(heading) => (
          <Item
            heading={heading}
            isActive={heading.id === activeId()}
            onActiveIdChange={(id) => setChildActiveId(id)}
          />
        )}
      </For>
    </ul>
  );
}

function Item(props: {
  heading: Heading;
  isActive: boolean;
  onActiveIdChange?: (id: string | null) => void;
}) {
  const [childActiveId, setChildActiveId] = createSignal<string | null>(null);
  const activeId = useActiveId(() => props.heading.children, childActiveId);

  createEffect(() => {
    if (props.onActiveIdChange) {
      props.onActiveIdChange(activeId());
    }
  });

  return (
    <li>
      <a
        href={`#${props.heading.id}`}
        class={clsx(
          "block break-keep py-1 text-[14px] font-medium leading-5",
          props.isActive ? "text-slate-8" : "text-slate-4",
        )}
      >
        {props.heading.title}
      </a>
      <Show when={props.heading.children.length > 0}>
        <ul class="m-0 block list-none p-0">
          <For each={props.heading.children}>
            {(heading) => (
              <SubItem
                heading={heading}
                depth={1}
                isActive={props.isActive && heading.id === activeId()}
                isParentActive={props.isActive}
                onActiveIdChange={(id) => setChildActiveId(id)}
              />
            )}
          </For>
        </ul>
      </Show>
    </li>
  );
}

function SubItem(props: {
  heading: Heading;
  depth: number;
  isActive: boolean;
  isParentActive: boolean;
  onActiveIdChange?: (id: string | null) => void;
}) {
  const [childActiveId, setChildActiveId] = createSignal<string | null>(null);
  const activeId = useActiveId(() => props.heading.children, childActiveId);

  createEffect(() => {
    props.onActiveIdChange?.(activeId());
  });

  return (
    <li
      class={clsx(
        "text-[14px] leading-5 transition-colors duration-300",
        // props.isActive && "bg-slate-100",
      )}
    >
      <a
        href={`#${props.heading.id}`}
        class={clsx(
          "transition-[padding-top,padding-bottom] block break-keep py-1 text-[14px] font-medium leading-5 duration-300 hover:text-portone",
          props.isActive
            ? "py-8px text-portone"
            : props.isParentActive
              ? "text-slate-4"
              : "text-slate-3",
          props.depth > 1 ? "font-normal" : "font-medium",
        )}
        style={{ "padding-left": `${12 * props.depth}px` }}
      >
        <div
          class={clsx(
            "pr-3.5 transition-transform duration-300",
            // props.isActive && "translate-x-2",
          )}
        >
          {props.heading.title}
        </div>
      </a>
      <Show when={props.heading.children.length > 0}>
        <ul class="transition-[padding-left] m-0 block list-none p-0 duration-300">
          <For each={props.heading.children}>
            {(heading) => (
              <SubItem
                heading={heading}
                depth={props.depth + 1}
                isActive={props.isActive && heading.id === activeId()}
                isParentActive={props.isParentActive}
                onActiveIdChange={(id) => setChildActiveId(id)}
              />
            )}
          </For>
        </ul>
      </Show>
    </li>
  );
}

function filterHeadingsById(headings: Heading[], ids: string[]): Heading[] {
  return headings
    .filter((heading) => ids.some((id) => id === heading.id))
    .map((heading) => ({
      ...heading,
      children: filterHeadingsById(heading.children, ids),
    }));
}
