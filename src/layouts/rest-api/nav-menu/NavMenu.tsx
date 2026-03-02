import { useLocation } from "@solidjs/router";
import clsx from "clsx";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSXElement,
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
  emptyCategories?: Set<string>;
  children?: JSXElement;
}

export default function NavMenu(props: Props) {
  const { systemVersion } = useSystemVersion();
  const location = useLocation();
  const items = createMemo(() => [
    { title: "개요", id: "overview" },
    ...props.items,
  ]);

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
          {(item) => {
            const empty = props.emptyCategories;
            if (empty?.has(item.id)) {
              if (item.children && item.children.length > 0) {
                const firstNonEmpty = item.children.find(
                  (c) => !empty.has(c.id),
                );
                if (!firstNonEmpty) return null;
                return (
                  <TopLevelItem
                    {...item}
                    linkId={firstNonEmpty.id}
                    basepath={props.basepath}
                    currentSection={props.currentSection}
                    emptyCategories={empty}
                  />
                );
              }
              return null;
            }
            return (
              <TopLevelItem
                {...item}
                basepath={props.basepath}
                currentSection={props.currentSection}
                emptyCategories={empty}
              />
            );
          }}
        </For>
        {props.children}
      </nav>
    </LeftSidebar>
  );
}

interface TopLevelItemProps extends NavMenuItem {
  basepath: string;
  currentSection: string;
  linkId?: string;
  emptyCategories?: Set<string>;
}
function TopLevelItem(props: TopLevelItemProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  const visibleChildren = createMemo(() => {
    if (!props.children) return undefined;
    const empty = props.emptyCategories;
    if (!empty) return props.children;
    const filtered = props.children.filter((c) => !empty.has(c.id));
    return filtered.length > 0 ? filtered : undefined;
  });

  createEffect(() => {
    const currentSection = props.currentSection;
    setIsOpen(
      props.id === currentSection ||
        !!visibleChildren()?.some((child) => child.id === currentSection),
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
          id={props.linkId ?? props.id}
          title={props.title}
          basepath={props.basepath}
        />
        <Show when={visibleChildren()?.length}>
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
      <Show when={visibleChildren()?.length}>
        <div
          class="mt-2 flex-col gap-2 border-l pl-2.5"
          classList={{ flex: isOpen(), hidden: !isOpen() }}
        >
          <For each={visibleChildren()}>
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
