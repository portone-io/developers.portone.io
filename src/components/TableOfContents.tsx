import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import type { MarkdownHeading } from "astro";
import clsx from "clsx";

interface Props {
  theme: "aside" | "island";
  items: TOCItem[];
}

interface TOCItem {
  title: string;
  id: string;
  depth: number;
  children: TOCItem[];
}

export function itemsFromHeadings(headings: MarkdownHeading[]): TOCItem[] {
  const items: TOCItem[] = [];

  function getParentItem(
    items: TOCItem[],
    targetDepth: number,
  ): TOCItem | undefined {
    const lastItem = items[items.length - 1];
    if (!lastItem || lastItem.depth > targetDepth) {
      return undefined;
    }
    if (lastItem.depth === targetDepth) {
      return lastItem;
    }
    return getParentItem(lastItem.children, targetDepth) ?? lastItem;
  }

  for (const heading of headings) {
    const parentItem = getParentItem(items, heading.depth - 1);
    if (parentItem) {
      parentItem.children.push({
        title: heading.text,
        id: heading.slug,
        depth: heading.depth,
        children: [],
      });
    } else {
      items.push({
        title: heading.text,
        id: heading.slug,
        depth: heading.depth,
        children: [],
      });
    }
  }
  return items;
}

function useActiveId(
  items: TOCItem[],
  childActiveId: Signal<string | null> | null = null,
) {
  const activeId = useSignal<string | null>(items[0]?.id ?? null);

  useSignalEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntry = entries.findLast(
          (entry) => entry.isIntersecting,
        );
        // 신규 진입 entry가 있을 경우 해당 entry를 활성 entry로 설정
        if (intersectingEntry) {
          activeId.value = intersectingEntry.target.id;
          return;
        }

        // 마지막으로 active였던 entry가 화면에서 사라지는 경우 처리
        const currentEntry = entries.find(
          (entry) => entry.target.id === activeId.peek(),
        );
        if (!currentEntry) return;

        const currentItem = items.find(
          (item) => item.id === currentEntry.target.id,
        );

        // 마지막으로 active였던 entry가 화면에서 사라지는데 하위 entry가 활성화되어 있지 않은 경우
        if (
          !currentEntry.isIntersecting &&
          (!childActiveId ||
            !currentItem?.children.some(
              (item) => item.id === childActiveId?.peek(),
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
              items[items.findIndex((item) => item.id === activeId.peek()) - 1];
            if (prevItem) activeId.value = prevItem.id;
            // 현재 entry가 현 depth에서 최상단 entry라면 activeId를 null로 설정
            else activeId.value = null;
          }
        }
      },
      { rootMargin: "-40% 0px", threshold: 0.00001 },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
      }
    }
    return () => {
      observer.disconnect();
    };
  });

  return activeId;
}

export default function TableOfContents(props: Props) {
  const childActiveId = useSignal<string | null>(null);
  const activeId = useActiveId(props.items, childActiveId);

  return (
    <ul class="m-0 flex flex-col list-none gap-6px p-0">
      {props.items.map((item) => (
        <Item
          key={item.id}
          item={item}
          isActive={item.id === activeId.value}
          onActiveIdChange={(id) => {
            childActiveId.value = id;
          }}
        />
      ))}
    </ul>
  );
}

function Item(props: {
  item: TOCItem;
  isActive: boolean;
  onActiveIdChange?: (id: string | null) => void;
}) {
  const childActiveId = useSignal<string | null>(null);
  const activeId = useActiveId(props.item.children, childActiveId);

  useSignalEffect(() => {
    if (props.onActiveIdChange) {
      props.onActiveIdChange(activeId.value);
    }
  });

  return (
    <li>
      <a
        href={`#${props.item.id}`}
        class={clsx(
          "py-6px block break-keep text-base font-medium",
          props.isActive ? "text-slate-6" : "text-slate-4",
        )}
      >
        {props.item.title}
      </a>
      {props.item.children.length > 0 && (
        <ul class="m-0 block list-none p-0">
          {props.item.children.map((item) => (
            <SubItem
              key={item.id}
              item={item}
              depth={1}
              isActive={props.isActive && item.id === activeId.value}
              onActiveIdChange={(id) => {
                childActiveId.value = id;
              }}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function SubItem(props: {
  item: TOCItem;
  depth: number;
  isActive: boolean;
  onActiveIdChange?: (id: string | null) => void;
}) {
  const childActiveId = useSignal<string | null>(null);
  const activeId = useActiveId(props.item.children, childActiveId);

  useSignalEffect(() => {
    if (props.onActiveIdChange) {
      props.onActiveIdChange(activeId.value);
    }
  });

  return (
    <li
      class={clsx(
        "text-sm transition-colors duration-300",
        // props.isActive && "bg-slate-100",
      )}
    >
      <a
        href={`#${props.item.id}`}
        class={clsx(
          "py-2px block break-keep transition-[padding-top,padding-bottom] duration-300",
          props.isActive
            ? "border-l-portone font-medium text-portone"
            : " border-l-slate-5 text-slate-4",
        )}
        style={{ paddingLeft: `${4 + 12 * (props.depth - 1)}px` }}
      >
        <div
          class={clsx(
            "pr-3.5 transition-transform duration-300",
            // props.isActive && "translate-x-2",
          )}
        >
          {props.item.title}
        </div>
      </a>
      {props.item.children.length > 0 && (
        <ul class="transition-[padding-left] m-0 block list-none p-0 duration-300">
          {props.item.children.map((item) => (
            <SubItem
              key={item.id}
              item={item}
              depth={props.depth + 1}
              isActive={props.isActive && item.id === activeId.value}
              onActiveIdChange={(id) => {
                childActiveId.value = id;
              }}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
