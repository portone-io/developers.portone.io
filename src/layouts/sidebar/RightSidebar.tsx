import type React from "react";

export interface RightSidebarProps {
  lang: string;
  toc: Toc;
}
export type Toc = TocItem[];
export interface TocItem {
  slug: string;
  text: string;
  children: TocItem[];
}
const RightSidebar: React.FC<RightSidebarProps> = ({ lang, toc }) => {
  return (
    <div class="text-slate-7 hidden w-56 min-w-0 shrink-0 lg:block">
      <nav class="w-inherit fixed my-4 h-[calc(100%-5.5rem)] overflow-y-auto px-2">
        <h2 class="mb-2 px-2 font-bold">{t(lang, "toc")}</h2>
        <ul>
          {toc.map((item) => (
            <TocLink key={item.slug} slug={item.slug} text={item.text}>
              <ul class="pl-2">
                {item.children.map((item) => (
                  <TocLink key={item.slug} slug={item.slug} text={item.text} />
                ))}
              </ul>
            </TocLink>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default RightSidebar;

interface TocLinkProps {
  slug: string;
  text: string;
  children?: any;
}
const TocLink: React.FC<TocLinkProps> = ({ slug, text, children }) => {
  return (
    <li key={slug}>
      <a
        href={`#${slug}`}
        onClick={(e) => {
          e.preventDefault();
          history.replaceState(null, "", `#${slug}`);
          document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <div class="hover:bg-slate-1 text-slate-5 overflow-hidden text-ellipsis whitespace-nowrap rounded-sm px-2 py-1 text-sm">
          {text}
        </div>
      </a>
      {children}
    </li>
  );
};

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
} satisfies Record<string, string>;
const en = {
  toc: "On this page",
  overview: "Overview",
} satisfies typeof ko;
function t(lang: string, key: keyof typeof ko): string {
  if (lang === "ko") return ko[key];
  return en[key];
}
