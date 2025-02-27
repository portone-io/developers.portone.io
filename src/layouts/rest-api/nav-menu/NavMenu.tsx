import { useLocation } from "@solidjs/router";
import clsx from "clsx";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSXElement,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { VersionSwitch } from "~/layouts/gnb/VersionSwitch";
import DropdownLink, { getDropdownLinks } from "~/layouts/sidebar/DropdownLink";
import LeftSidebar from "~/layouts/sidebar/LeftSidebar";
import { useSystemVersion } from "~/state/system-version";

import NavMenuLink from "./NavMenuLink";

export interface NavMenuItem {
  title: string;
  id: string;
  children?: NavMenuItem[];
}

interface Props {
  title: string;
  items: NavMenuItem[];
  basepath: string;
  currentSection: string;
  onSectionChange: (section: string) => void;
  children?: JSXElement;
}

export default function NavMenu(props: Props) {
  const { systemVersion } = useSystemVersion();
  const location = useLocation();
  const items = createMemo(() => [
    { title: "개요", id: "overview" },
    ...props.items,
    { title: "타입 정의", id: "type-def" },
  ]);

  onMount(() => {
    interface SectionData {
      isIntersecting: boolean;
      intersectionRatio: number;
      offsetTop: number;
    }

    const sectionData = new Map<string, SectionData>();
    const article = document.getElementById("overview")!.closest("article")!;
    const sections = Array.from(article.children).filter(
      (child) => child.tagName === "SECTION",
    );
    for (const section of sections) {
      const { id, offsetTop } = section as HTMLElement;
      sectionData.set(id, {
        isIntersecting: false,
        intersectionRatio: 0,
        offsetTop,
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const data = sectionData.get(entry.target.id);
          if (!data) continue;
          const { isIntersecting, intersectionRatio } = entry;
          Object.assign(data, { isIntersecting, intersectionRatio });
        }
        // 지금 화면에 보이고있는 section들
        const intersectingSections = [...sectionData.entries()]
          .filter(([, data]) => data.isIntersecting)
          .sort(([, a], [, b]) => {
            // 화면에 보이는 section 중에서 사용자가 지금 관심있어할법한 section 순으로 정렬함.
            // 우선 intersectionRatio가 큰 걸 찾는다.
            // intersectionRatio가 0.5면 화면에 반쯤 보이고 있다는 뜻이고, 1이면 화면 안에 전부 들어와있다는 뜻이다.
            // intersectionRatio가 둘 다 1이면 (두 section의 모든 내용이 전부 화면에 보이고 있다면) offsetTop이 작은 걸 찾는다.
            // offsetTop이 작다는 것은 화면에서 위쪽에 보인다는 뜻이다.
            const aRatio = a.intersectionRatio;
            const bRatio = b.intersectionRatio;
            if (aRatio !== bRatio) return bRatio - aRatio; // descending
            const aTop = a.offsetTop;
            const bTop = b.offsetTop;
            return aTop - bTop; // ascending
          });

        const newSection = intersectingSections[0]?.[0];
        if (newSection && newSection !== props.currentSection) {
          props.onSectionChange(newSection);
        }
      },
      {
        rootMargin: "-104px 0px 0px 0px", // gnb height
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      },
    );
    sections.forEach((section) => observer.observe(section));
    function resizeHandler() {
      for (const section of sections) {
        const { id, offsetTop } = section as HTMLElement;
        const data = sectionData.get(id);
        if (data) data.offsetTop = offsetTop;
      }
    }
    window.addEventListener("resize", resizeHandler);
    onCleanup(() => {
      window.removeEventListener("resize", resizeHandler);
      observer.disconnect();
    });
  });

  return (
    <LeftSidebar>
      <div class="pr-4 pt-5">
        <div class="md:hidden">
          <DropdownLink
            pathname={location.pathname}
            items={getDropdownLinks(systemVersion())}
          />
          <div class="my-4 h-1px bg-slate-200"></div>
        </div>
      </div>
      <div class="pb-1 pl-2 pr-6">
        <VersionSwitch />
      </div>
      <div class="px-2 pb-2 pt-3 text-lg font-bold">{props.title}</div>
      <hr class="mx-4" />
      <nav
        id="nav-menu"
        class="scrollbar-thin flex flex-1 flex-col gap-2 overflow-y-scroll p-2 text-sm text-slate-6"
      >
        <For each={items()}>
          {(item) => (
            <TopLevelItem
              {...item}
              basepath={props.basepath}
              currentSection={props.currentSection}
            />
          )}
        </For>
        {props.children}
      </nav>
    </LeftSidebar>
  );
}

interface TopLevelItemProps extends NavMenuItem {
  basepath: string;
  currentSection: string;
}
function TopLevelItem(props: TopLevelItemProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  createEffect(() => {
    const currentSection = props.currentSection;
    setIsOpen(
      props.id === currentSection ||
        !!props.children?.some((child) => child.id === currentSection),
    );
  });

  return (
    <div>
      <div
        class={clsx(
          "flex rounded-1.5 tracking-tight hover:bg-slate-1",
          props.id === props.currentSection &&
            "bg-slate-1 text-orange-5 font-bold",
        )}
      >
        <NavMenuLink
          id={props.id}
          title={props.title}
          basepath={props.basepath}
        />
        <Show when={props.children && props.children.length}>
          <button
            class="h-full flex items-center p-2"
            onClick={() => setIsOpen(!isOpen())}
          >
            <i
              class="inline-block"
              classList={{
                "i-ic-baseline-keyboard-arrow-right": !isOpen(),
                "i-ic-baseline-keyboard-arrow-down": isOpen(),
              }}
            />
          </button>
        </Show>
      </div>
      <Show when={props.children && props.children.length}>
        <div
          class="mt-2 flex-col gap-2 border-l pl-2.5"
          classList={{ flex: isOpen(), hidden: !isOpen() }}
        >
          <For each={props.children}>
            {(child) => (
              <ChildItem
                {...child}
                parentId={props.id}
                basepath={props.basepath}
                currentSection={props.currentSection}
                setParentOpen={(open) => setIsOpen(open)}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

interface ChildItemProps extends NavMenuItem {
  parentId: string;
  basepath: string;
  currentSection: string;
  setParentOpen: (open: boolean) => void;
}

function ChildItem(props: ChildItemProps) {
  return (
    <div
      class={clsx(
        "rounded-1.5 tracking-tight hover:bg-slate-1",
        props.id === props.currentSection &&
          "bg-slate-1 text-orange-5 font-bold",
      )}
    >
      <NavMenuLink
        id={props.id}
        title={props.title}
        basepath={props.basepath}
      />
    </div>
  );
}
