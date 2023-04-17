import type * as React from "react";
import type { NavMenuPage } from "~/state/server-only/nav";

const LeftSidebarItem: React.FC<NavMenuPage> = (props) => {
  if (props.items.length > 0) return <FolderLink {...props} />;
  const { emoji, title, slug } = props;
  return <JustLink emoji={emoji} title={title} slug={slug} />;
};
export default LeftSidebarItem;

export const FolderLink: React.FC<NavMenuPage> = ({
  emoji,
  title,
  slug,
  items,
}) => {
  return (
    <div>
      <div class={`flex ${anchorStyle} pr-0`}>
        <a href={`/docs${slug}`} class="grow">
          <LinkTitle emoji={emoji} title={title} />
        </a>
        <button class="p-2 h-full flex items-center">
          <i class="inline-block i-ic-baseline-keyboard-arrow-down" />
        </button>
      </div>
      <div class="pl-2">
        <ul class="pl-2 flex flex-col gap-1 border-l">
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
  emoji: string;
  title: string;
  slug: string;
}
export const JustLink: React.FC<JustLinkProps> = ({ emoji, title, slug }) => {
  return (
    <a href={`/docs${slug}`} class={anchorStyle}>
      <LinkTitle emoji={emoji} title={title} />
    </a>
  );
};

const anchorStyle =
  "px-2 block text-sm text-slate-500 rounded hover:bg-slate-1";

interface LinkTitleProps {
  emoji: string;
  title: string;
}
const LinkTitle: React.FC<LinkTitleProps> = ({ emoji, title }) => {
  return (
    <span class="block py-1">
      {emoji && <span class="mr-2">{emoji}</span>}
      <span>{title || <span class="text-red">(unknown page)</span>}</span>
    </span>
  );
};
