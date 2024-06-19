import { createMemo, For, onMount, Show } from "solid-js";

import { type NavMenuPage } from "~/state/nav";
import { useSystemVersion } from "~/state/system-version";
import type { SystemVersion } from "~/type";

import { useNavOpenStates } from "./DocsNavMenu";

function LeftSidebarItem(props: NavMenuPage & { pageSlug: string }) {
  const { systemVersion } = useSystemVersion();
  const isActive = createMemo(() => props.pageSlug === props.path);
  const path = createMemo(() => {
    try {
      return { href: new URL(props.path).toString(), isExternal: true };
    } catch (e) {
      return { href: `/docs${props.path}`, isExternal: false };
    }
  });
  return (
    <Show
      when={props.items.length === 0}
      fallback={<FolderLink {...props} isActive={isActive()} />}
    >
      <JustLink
        title={props.title}
        href={path().href}
        isExternal={path().isExternal}
        isActive={isActive()}
        systemVersion={props.systemVersion ?? systemVersion()}
      />
    </Show>
  );
}
export default LeftSidebarItem;

function FolderLink(
  props: NavMenuPage & { pageSlug: string; isActive: boolean },
) {
  const { systemVersion } = useSystemVersion();
  const { openNavs, toggleNav } = useNavOpenStates();
  const isOpen = createMemo(() => openNavs().has(props.path));
  let anchorRef: HTMLDivElement | undefined;

  onMount(() => {
    if (props.isActive && anchorRef) {
      const scrollArea = document.getElementById("nav-menu")!;
      scrollArea.scrollTop =
        anchorRef.getBoundingClientRect().top -
        scrollArea.getBoundingClientRect().top -
        50;
    }
  });

  return (
    <Show when={systemVersion() === props.systemVersion}>
      <div ref={anchorRef}>
        <div class={`flex ${getLinkStyle(props.isActive)} pr-0`}>
          <a
            href={[
              "/docs",
              props.path,
              props.systemVersion && `?v=${props.systemVersion}`,
            ]
              .filter(Boolean)
              .join("")}
            class="grow"
          >
            <LinkTitle title={props.title} />
          </a>
          <button
            class="h-full flex items-center p-2"
            onClick={() => toggleNav(props.path)}
          >
            <i
              class="inline-block"
              classList={{
                "i-ic-baseline-keyboard-arrow-down": isOpen(),
                "i-ic-baseline-keyboard-arrow-right": !isOpen(),
              }}
            />
          </button>
        </div>
        <div class="pl-2" classList={{ block: isOpen(), hidden: !isOpen() }}>
          <ul class="flex flex-col gap-1 border-l pl-2">
            <For each={props.items}>
              {(item) => (
                <Show when={systemVersion() === item.systemVersion}>
                  <LeftSidebarItem {...item} pageSlug={props.pageSlug} />
                </Show>
              )}
            </For>
          </ul>
        </div>
      </div>
    </Show>
  );
}

export interface JustLinkProps {
  title: string;
  href: string;
  isExternal?: boolean;
  isActive: boolean;
  systemVersion?: SystemVersion | undefined;
  event?: {
    name: string;
    props: object;
  };
}
export function JustLink(props: JustLinkProps) {
  const { systemVersion } = useSystemVersion();

  return (
    <Show when={systemVersion() === props.systemVersion}>
      <a
        href={
          !props.isExternal && props.systemVersion
            ? `${props.href}?v=${props.systemVersion}`
            : props.href
        }
        class={getLinkStyle(props.isActive)}
        onClick={() =>
          props.event && trackEvent(props.event.name, props.event.props)
        }
        target={props.isExternal ? "_blank" : "_self"}
      >
        <LinkTitle title={props.title} isExternal={props.isExternal} />
      </a>
    </Show>
  );
}

export function getLinkStyle(isActive: boolean): string {
  return `px-2 block text-sm rounded ${
    isActive
      ? "font-bold text-orange-600 bg-orange-1"
      : "text-slate-500 hover:bg-slate-1"
  }`;
}

interface LinkTitleProps {
  title: string;
  isExternal?: boolean | undefined;
}
export function LinkTitle(props: LinkTitleProps) {
  return (
    <span class="flex items-center gap-2 py-1">
      <span>
        <Show
          when={props.title}
          fallback={<span class="text-red">(unknown page)</span>}
        >
          {props.title}
        </Show>
      </span>
      <Show when={props.isExternal}>
        <i class="i-ic-baseline-open-in-new inline-block opacity-70" />
      </Show>
    </span>
  );
}
