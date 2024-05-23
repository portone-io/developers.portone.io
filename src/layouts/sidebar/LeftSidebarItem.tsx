import { useComputed } from "@preact/signals";

import { useSystemVersion } from "#state/system-version";
import { navOpenStatesSignal, slugSignal } from "~/state/nav";
import type { NavMenuPage } from "~/state/server-only/nav";
import type { SystemVersion } from "~/type";

function LeftSidebarItem(props: NavMenuPage) {
  const systemVersion = useSystemVersion();
  if (props.items.length > 0) return <FolderLink {...props} />;
  const { title, path } = props;
  const pageSlug = slugSignal.value;
  const isActive = pageSlug === path;
  const [href, isExternal] = (() => {
    try {
      return [new URL(path).toString(), true];
    } catch (e) {
      return [`/docs${path}`, false];
    }
  })();
  return (
    <JustLink
      title={title}
      href={href}
      isExternal={isExternal}
      isActive={isActive}
      systemVersion={props.systemVersion ?? systemVersion}
    />
  );
}
export default LeftSidebarItem;

function FolderLink({ title, path, items, systemVersion }: NavMenuPage) {
  const openSignal = useComputed(() => !!navOpenStatesSignal.value[path]);
  const open = openSignal.value;
  const pageSlug = slugSignal.value;
  const isActive = pageSlug === path;
  return (
    <div data-system-version={systemVersion}>
      <div
        class={`flex ${getLinkStyle(isActive)} pr-0`}
        data-active={isActive && "active"} // true로 지정하면 SSR시에는 값 없이 attr key만 들어감
      >
        <a
          href={["/docs", path, systemVersion && `?v=${systemVersion}`]
            .filter(Boolean)
            .join("")}
          class="grow"
        >
          <LinkTitle title={title} />
        </a>
        <button
          class="h-full flex items-center p-2"
          onClick={() => {
            navOpenStatesSignal.value = {
              ...navOpenStatesSignal.value,
              [path]: !open,
            };
          }}
        >
          <i
            class={`inline-block ${
              open
                ? "i-ic-baseline-keyboard-arrow-down"
                : "i-ic-baseline-keyboard-arrow-right"
            }`}
          />
        </button>
      </div>
      <div class={`${open ? "block" : "hidden"} pl-2`}>
        <ul class="flex flex-col gap-1 border-l pl-2">
          {items.map((item) => (
            <li key={item.path} data-system-version={item.systemVersion}>
              <LeftSidebarItem {...item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
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
export function JustLink({
  title,
  href,
  isExternal,
  isActive,
  systemVersion,
  event,
}: JustLinkProps) {
  return (
    <a
      data-system-version={systemVersion}
      href={!isExternal && systemVersion ? `${href}?v=${systemVersion}` : href}
      class={getLinkStyle(isActive)}
      data-active={isActive && "active"}
      onClick={() => event && trackEvent(event.name, event.props)}
      target={isExternal ? "_blank" : "_self"}
    >
      <LinkTitle title={title} isExternal={isExternal} />
    </a>
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
export function LinkTitle({ title, isExternal }: LinkTitleProps) {
  return (
    <span class="flex items-center gap-2 py-1">
      <span>{title || <span class="text-red">(unknown page)</span>}</span>
      {isExternal && (
        <i class="i-ic-baseline-open-in-new inline-block opacity-70" />
      )}
    </span>
  );
}
