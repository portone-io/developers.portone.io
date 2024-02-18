/* @jsxImportSource solid-js */

import { For, Match, Switch, createMemo } from "solid-js";
import { clsx } from "clsx";
import type { NavMenuPage } from "~/state/server-only/nav";
import {
  slug as globalSlug,
  navOpenStates,
  setNavOpenStates,
  systemVersion,
} from "~/state/nav";
import type { SystemVersion } from "~/type";

function LeftSidebarItem(props: NavMenuPage) {
  const isActive = createMemo(() => globalSlug() === props.slug);
  const href = createMemo(() => `/docs${props.slug}`);

  return (
    <Switch
      fallback={
        <JustLink title={props.title} href={href()} isActive={isActive()} />
      }
    >
      <Match when={props.items.length > 0}>
        <FolderLink {...props} />
      </Match>
    </Switch>
  );
}
export default LeftSidebarItem;

function FolderLink(props: NavMenuPage) {
  const isOpen = createMemo(() => !!navOpenStates()[props.slug]);
  const isActive = createMemo(() => globalSlug() === props.slug);

  return (
    <div data-system-version={systemVersion()}>
      <div
        class={clsx("flex pr-0", getLinkStyle(isActive()))}
        data-active={isActive() && "active"} // true로 지정하면 SSR시에는 값 없이 attr key만 들어감
      >
        <a href={`/docs${props.slug}`} class="grow">
          <LinkTitle title={props.title} />
        </a>
        <button
          type="button"
          class="flex h-full items-center p-2"
          onClick={() => {
            setNavOpenStates((prev) => ({
              ...prev,
              [props.slug]: !isOpen(),
            }));
          }}
        >
          <i
            class={clsx(
              "inline-block",
              isOpen()
                ? "i-ic-baseline-keyboard-arrow-down"
                : "i-ic-baseline-keyboard-arrow-right",
            )}
          />
        </button>
      </div>
      <div class={clsx("pl-2", isOpen() ? "block" : "hidden")}>
        <ul class="flex flex-col gap-1 border-l pl-2">
          <For each={props.items}>
            {(item) => (
              <li data-system-version={item.systemVersion}>
                <LeftSidebarItem {...item} />
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}

export interface JustLinkProps {
  title: string;
  href: string;
  isActive: boolean;
  systemVersion?: SystemVersion;
  event?: {
    name: string;
    props: object;
  };
}
export function JustLink(props: JustLinkProps) {
  return (
    <a
      data-system-version={props.systemVersion}
      href={props.href}
      class={getLinkStyle(props.isActive)}
      data-active={props.isActive && "active"}
      onClick={() =>
        props.event && trackEvent(props.event.name, props.event.props)
      }
    >
      <LinkTitle title={props.title} />
    </a>
  );
}

export function getLinkStyle(isActive: boolean): string {
  return clsx(
    "px-2 block text-sm rounded",
    isActive
      ? "font-bold text-orange-600 bg-orange-1"
      : "text-slate-500 hover:bg-slate-1",
  );
}

interface LinkTitleProps {
  title: string;
}
function LinkTitle(props: LinkTitleProps) {
  return (
    <span class="flex gap-2 py-1">
      <span>{props.title || <span class="text-red">(unknown page)</span>}</span>
    </span>
  );
}
