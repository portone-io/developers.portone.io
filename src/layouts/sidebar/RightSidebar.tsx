import type React from "preact/compat";

export interface RightSidebarProps {
  lang: string;
  slug: string;
  toc: Toc;
  editThisPagePrefix?: string;
}
export type Toc = TocItem[];
export interface TocItem {
  slug: string;
  text: string;
  children: TocItem[];
}
function RightSidebar({
  lang,
  slug,
  toc,
  editThisPagePrefix = "https://github.com/portone-io/developers.portone.io/blob/main/src/content/docs",
}: RightSidebarProps) {
  return (
    <div class="hidden min-w-0 w-56 shrink-0 text-slate-7 lg:block">
      <nav class="fixed h-[calc(100%-56px)] w-inherit overflow-y-auto px-2 py-[28px]">
        <h2 class="mb-2 px-2 font-bold">{t(lang, "toc")}</h2>
        <ul>
          {toc.map((item) => (
            <SidebarItem
              key={item.slug}
              href={`#${item.slug}`}
              label={item.text}
            >
              <ul class="pl-2">
                {item.children.map((item) => (
                  <SidebarItem
                    key={item.slug}
                    href={`#${item.slug}`}
                    label={item.text}
                  />
                ))}
              </ul>
            </SidebarItem>
          ))}
        </ul>
        <h2 class="mb-2 mt-4 px-2 font-bold">{t(lang, "contribute")}</h2>
        <ul>
          <SidebarItem
            href={`${editThisPagePrefix}${slug}.mdx`}
            icon="i-ic-baseline-edit"
            label={t(lang, "edit-this-page")}
          />
        </ul>
      </nav>
    </div>
  );
}

export default RightSidebar;

interface LinkProps {
  href: string;
  icon?: string;
  label: React.ReactNode;
  children?: React.ReactNode;
}
function SidebarItem({ href, icon, label, children }: LinkProps) {
  return (
    <li>
      <a
        href={href}
        onClick={(e) => {
          if (!href.startsWith("#")) return;
          e.preventDefault();
          const slug = href.slice(1);
          history.replaceState(null, "", href);
          document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <div class="overflow-hidden text-ellipsis whitespace-nowrap rounded-sm px-2 py-1 text-sm text-slate-5 hover:bg-slate-1">
          {icon && (
            <>
              <i class={`${icon} inline-block align-top text-lg`}></i>{" "}
            </>
          )}
          {label}
        </div>
      </a>
      {children}
    </li>
  );
}

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export function headingsToToc(lang: string, headings: Heading[]): Toc {
  const result: Toc = [
    { slug: "overview", text: t(lang, "overview"), children: [] },
  ];
  let recent2: TocItem | undefined;
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
