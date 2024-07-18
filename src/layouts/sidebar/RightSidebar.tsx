import {
  createEffect,
  createSignal,
  For,
  type JSXElement,
  mergeProps,
  Show,
} from "solid-js";

import { useSystemVersion } from "~/state/system-version";

export interface RightSidebarProps {
  lang: string;
  slug: string;
  editThisPagePrefix?: string;
}
export type Toc = TocItem[];
export interface TocItem {
  slug: string;
  text: string;
  children: TocItem[];
}
function RightSidebar(_props: RightSidebarProps) {
  const props = mergeProps({
    editThisPagePrefix:
      "https://github.com/portone-io/developers.portone.io/blob/main/src/content/docs",
  }, _props);

  const [toc, setToc] = createSignal<Toc | null>(null);
  const { systemVersion } = useSystemVersion();

  createEffect(() => {
    void systemVersion();
    setToc(headingsToToc(props.lang));
  });

  return (
    <div class="hidden min-w-0 w-56 shrink-0 text-slate-7 lg:block">
      <Show when={toc()}>
        <nav class="fixed h-[calc(100%-56px)] w-inherit overflow-y-auto px-2 py-[28px]">
          <h2 class="mb-2 px-2 font-bold">{t(props.lang, "toc")}</h2>
          <ul>
            <For each={toc()}>
              {(item) => (
                <SidebarItem href={`#${item.slug}`} label={item.text}>
                  <ul class="pl-2">
                    <For each={item.children}>
                      {(item) => (
                        <SidebarItem href={`#${item.slug}`} label={item.text} />
                      )}
                    </For>
                  </ul>
                </SidebarItem>
              )}
            </For>
          </ul>
          <h2 class="mb-2 mt-4 px-2 font-bold">
            {t(props.lang, "contribute")}
          </h2>
          <ul>
            <SidebarItem
              href={`${props.editThisPagePrefix}/${props.lang}/${props.slug}.mdx`}
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
        <div class="overflow-hidden text-ellipsis whitespace-nowrap rounded-sm px-2 py-1 text-sm text-slate-5 hover:bg-slate-1">
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

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export function headingsToToc(lang: string): Toc {
  const result: Toc = [
    { slug: "overview", text: t(lang, "overview"), children: [] },
  ];
  let recent2: TocItem | undefined;
  const headings: Heading[] = [
    ...document.querySelectorAll("article :is(h2, h3)"),
  ].map((el) => ({
    depth: Number(el.tagName.slice(1)),
    slug: el.id,
    text: el.textContent ?? "",
  }));
  for (const h of headings.filter((h) => h.depth === 2 || h.depth === 3)) {
    const item = { ...h, children: [] };
    if (recent2 && item.depth === 3) recent2.children.push(item);
    else result.push(item);
    if (item.depth === 2) recent2 = item;
  }
  return result;
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
