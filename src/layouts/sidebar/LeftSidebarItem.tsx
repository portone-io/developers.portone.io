import { useComputed } from "@preact/signals";

import { navOpenStatesSignal, slugSignal } from "~/state/nav";
import type { NavMenuPage } from "~/state/server-only/nav";
import type { SystemVersion } from "~/type";

function LeftSidebarItem(props: NavMenuPage) {
  if (props.items.length > 0) return <FolderLink {...props} />;
  const { title, slug } = props;
  const pageSlug = slugSignal.value;
  const isActive = pageSlug === slug;
  const href = `/docs${slug}`;
  return (
    <JustLink
      title={title}
      href={href}
      isActive={isActive}
      systemVersion={props.systemVersion}
    />
  );
}
export default LeftSidebarItem;

function FolderLink({ title, slug, items, systemVersion }: NavMenuPage) {
  const openSignal = useComputed(() => !!navOpenStatesSignal.value[slug]);
  const open = openSignal.value;
  const pageSlug = slugSignal.value;
  const isActive = pageSlug === slug;
  return (
    <div data-system-version={systemVersion}>
      <div
        class={`flex ${getLinkStyle(isActive)} pr-0`}
        data-active={isActive && "active"} // true로 지정하면 SSR시에는 값 없이 attr key만 들어감
      >
        <a href={`/docs${slug}?v=${systemVersion}`} class="grow">
          <LinkTitle title={title} />
        </a>
        <button
          class="h-full flex items-center p-2"
          onClick={() => {
            navOpenStatesSignal.value = {
              ...navOpenStatesSignal.value,
              [slug]: !open,
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
            <li key={item.slug} data-system-version={item.systemVersion}>
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
  isActive,
  systemVersion,
  event,
}: JustLinkProps) {
  return (
    <a
      data-system-version={systemVersion}
      href={systemVersion ? `${href}?v=${systemVersion}` : href}
      class={getLinkStyle(isActive)}
      data-active={isActive && "active"}
      onClick={() => event && trackEvent(event.name, event.props)}
    >
      <LinkTitle title={title} />
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
}
function LinkTitle({ title }: LinkTitleProps) {
  return (
    <span class="flex gap-2 py-1">
      <span>{title || <span class="text-red">(unknown page)</span>}</span>
    </span>
  );
}
