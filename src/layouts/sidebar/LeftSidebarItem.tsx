import { useComputed } from "@preact/signals";
import type * as React from "react";

import type { NavMenuPage } from "~/state/server-only/nav";
import { navOpenStatesSignal, slugSignal } from "~/state/nav";

const LeftSidebarItem: React.FC<NavMenuPage> = (props) => {
  if (props.items.length > 0) return <FolderLink {...props} />;
  const { emoji, title, slug } = props;
  const pageSlug = slugSignal.value;
  const isActive = pageSlug === slug;
  const href = `/docs${slug}`;
  return (
    <JustLink emoji={emoji} title={title} href={href} isActive={isActive} />
  );
};
export default LeftSidebarItem;

const FolderLink: React.FC<NavMenuPage> = ({ emoji, title, slug, items }) => {
  const openSignal = useComputed(() => !!navOpenStatesSignal.value[slug]);
  const open = openSignal.value;
  const pageSlug = slugSignal.value;
  const isActive = pageSlug === slug;
  return (
    <div>
      <div
        class={`flex ${getLinkStyle(isActive)} pr-0`}
        data-active={isActive && "active"} // true로 지정하면 SSR시에는 값 없이 attr key만 들어감
      >
        <a href={`/docs${slug}`} class="grow">
          <LinkTitle emoji={emoji} title={title} />
        </a>
        <button
          class="flex h-full items-center p-2"
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
            <li key={item.slug}>
              <LeftSidebarItem {...item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export interface JustLinkProps {
  emoji?: string;
  title: string;
  href: string;
  isActive: boolean;
}
export const JustLink: React.FC<JustLinkProps> = ({
  emoji,
  title,
  href,
  isActive,
}) => {
  return (
    <a
      href={href}
      class={getLinkStyle(isActive)}
      data-active={isActive && "active"}
    >
      <LinkTitle emoji={emoji || ""} title={title} />
    </a>
  );
};

export function getLinkStyle(isActive: boolean): string {
  return `px-2 block text-sm rounded ${
    isActive
      ? "font-bold text-orange-600 bg-orange-1"
      : "text-slate-500 hover:bg-slate-1"
  }`;
}

interface LinkTitleProps {
  emoji: string;
  title: string;
}
const LinkTitle: React.FC<LinkTitleProps> = ({ emoji, title }) => {
  return (
    <span class="flex gap-2 py-1">
      {emoji && <span>{emoji}</span>}
      <span>{title || <span class="text-red">(unknown page)</span>}</span>
    </span>
  );
};
