import { type JSXElement, mergeProps, Show } from "solid-js";

import TableOfContents from "~/components/TableOfContents";
import type { Heading } from "~/genCollections";

export interface RightSidebarProps {
  lang: string;
  file: string;
  headings: Heading[];
  editThisPagePrefix?: string;
}
function RightSidebar(_props: RightSidebarProps) {
  const props = mergeProps(
    {
      editThisPagePrefix:
        "https://github.com/portone-io/developers.portone.io/blob/main",
    },
    _props,
  );

  return (
    <div class="hidden min-w-0 w-55 shrink-0 text-slate-7 lg:block">
      <Show when={true}>
        <nav class="fixed h-[calc(100%-56px)] w-inherit overflow-y-auto px-2 py-[28px]">
          <h2 class="my-2 text-sm text-slate-8 font-medium">
            {t(props.lang, "toc")}
          </h2>
          <TableOfContents theme="aside" headings={props.headings} />
          <h2 class="my-2 mt-4 text-sm text-slate-8 font-medium">
            {t(props.lang, "contribute")}
          </h2>
          <ul>
            <SidebarItem
              href={`${props.editThisPagePrefix}/${props.file}`}
              icon="i-ic-baseline-edit"
              label={t(props.lang, "edit-this-page")}
            />
          </ul>
        </nav>
      </Show>
    </div>
  );
}

export default RightSidebar;

interface LinkProps {
  href: string;
  icon?: string;
  label: JSXElement;
  children?: JSXElement;
}
function SidebarItem(props: LinkProps) {
  return (
    <li>
      <a
        href={props.href}
        onClick={(e) => {
          if (!props.href.startsWith("#")) return;
          e.preventDefault();
          const slug = props.href.slice(1);
          history.replaceState(null, "", props.href);
          document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <div class="overflow-hidden text-ellipsis whitespace-nowrap rounded-sm px-2 py-1 text-.8125rem text-slate-4 leading-5 hover:text-portone">
          <Show when={props.icon}>
            <>
              <i class={`${props.icon} inline-block align-top text-lg`}></i>{" "}
            </>
          </Show>
          {props.label}
        </div>
      </a>
      {props.children}
    </li>
  );
}

const ko = {
  toc: "목차",
  overview: "개요",
  contribute: "기여하기",
  "edit-this-page": "이 페이지 수정하기",
} satisfies Record<string, string>;
const en = {
  toc: "On this page",
  overview: "Overview",
  contribute: "Contribute",
  "edit-this-page": "Edit this page",
} satisfies typeof ko;
function t(lang: string, key: keyof typeof ko): string {
  if (lang === "ko") return ko[key];
  return en[key];
}
