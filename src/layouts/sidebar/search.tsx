import { A } from "@solidjs/router";
import Fuse from "fuse.js";
import {
  createContext,
  createMemo,
  createResource,
  createSignal,
  For,
  type JSXElement,
  Match,
  Show,
  Switch,
  useContext,
} from "solid-js";

import { lazy } from "~/misc/async";
import type { NavMenuSystemVersions } from "~/state/nav";
import { useSystemVersion } from "~/state/system-version";

const SearchContext = createContext({
  open: (): boolean => false,
  setOpen: (_: boolean): void => {},
});

export function SearchProvider(props: { children: JSXElement }) {
  const [open, setOpen] = createSignal(false);

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {props.children}
    </SearchContext.Provider>
  );
}

export const useSearchContext = () => useContext(SearchContext);

export interface SearchButtonProps {
  lang: string;
}
export function SearchButton({ lang }: SearchButtonProps) {
  const { setOpen } = useSearchContext();
  const ctrlKey = createMemo(() =>
    typeof navigator !== "undefined" &&
    navigator.platform &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
      ? "⌘"
      : "Ctrl",
  );

  return (
    <button
      class="max-w-100 flex flex-1 items-center gap-1.5 border-1 border-slate-3 rounded-6px px-3 py-1.5 text-slate-4"
      onClick={() => setOpen(true)}
    >
      <i class="i-ic-baseline-search text-2xl"></i>
      <span>{t(lang, "search")}</span>
      <kbd class="ml-auto flex gap-.5 border border-slate-2 rounded-6px px-1.5 py-.5">
        <kbd class="text-sm">{ctrlKey()}</kbd>
        <kbd class="text-sm">K</kbd>
      </kbd>
    </button>
  );
}

export const searchIndexKo = lazy(() => fetchSearchIndex("ko"));
export const searchIndexEn = lazy(() => fetchSearchIndex("en"));
async function fetchSearchIndex(lang: string): Promise<SearchIndex> {
  const res = await fetch(`/content-index/opi-${lang}.json`);
  return JSON.parse((await res.text()).normalize("NFKD")) as SearchIndex;
}

export type SearchIndex = SearchIndexItem[];
export interface SearchIndexItem {
  slug: string;
  title?: string;
  description?: string;
  text: string;
}

export interface SearchScreenProps {
  lang: string;
  navMenuSystemVersions: NavMenuSystemVersions;
}
export function SearchScreen(props: SearchScreenProps) {
  const { open, setOpen } = useSearchContext();
  const { systemVersion } = useSystemVersion();
  let inputRef: HTMLInputElement | undefined;

  const [searchText, setSearchText] = createSignal("");
  const [searchIndex] = createResource(
    () => open() && props.lang,
    async (lang) => {
      inputRef?.focus();
      return await (lang === "ko" ? searchIndexKo : searchIndexEn);
    },
    { initialValue: undefined },
  );
  const fuse = createMemo(() => {
    const index = searchIndex.latest;
    if (!index) return;
    const filteredIndex = index
      .filter((item) => {
        const navMenuSystemVersion =
          props.navMenuSystemVersions[item.slug.replace(/^opi/, "")];
        if (!navMenuSystemVersion) return true;
        return navMenuSystemVersion === systemVersion();
      })
      .map((item) => {
        const slug = item.slug.replace(/\/index$/, "");
        return { ...item, slug };
      });
    return new Fuse(filteredIndex, { keys: ["title", "description", "text"] });
  });
  const searchResult = createMemo(() => {
    const text = searchText();
    const f = fuse();
    if (!text || !f) return [];
    return f.search(text.normalize("NFKD"));
  });

  const closeSearchScreen = () => {
    setOpen(false);
    document.body.focus();
  };

  return (
    <div
      class={`fixed left-0 top-0 z-search h-full w-full transition bg-[rgba(0,0,0,0.6)] ${
        open() ? "backdrop-blur-sm" : "pointer-events-none opacity-0"
      }`}
      onClick={closeSearchScreen}
    >
      <div
        class="mx-auto h-full w-full flex flex-col border bg-white sm:mt-18 sm:max-h-1/2 sm:min-h-80 sm:w-150 sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex">
          <input
            class="flex-1 bg-transparent p-4"
            ref={inputRef}
            placeholder={t(props.lang, "searchContent")}
            value={searchText()}
            onInput={(e) => setSearchText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSearchScreen();
            }}
          />
          <button class="px-4 sm:hidden" onClick={closeSearchScreen}>
            <i class="i-ic-baseline-close block text-2xl"></i>
          </button>
        </div>
        <div class="flex flex-1 flex-col overflow-y-auto border-t">
          <Switch fallback={<Waiting />}>
            <Match when={searchResult().length > 0}>
              <ul>
                <For each={searchResult()}>
                  {({ item }) => (
                    <A
                      href={`/${item.slug}`}
                      tabIndex={0}
                      onClick={closeSearchScreen}
                    >
                      <li class="px-4 py-2 hover:bg-slate-1">
                        <div class="text-sm">{item.title}</div>
                        <Show when={item.description}>
                          <div class="text-xs text-slate-4">
                            {item.description}
                          </div>
                        </Show>
                      </li>
                    </A>
                  )}
                </For>
              </ul>
            </Match>
            <Match when={fuse()}>
              <Empty lang={props.lang} />
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
}

interface EmptyProps {
  lang: string;
}
function Empty({ lang }: EmptyProps) {
  return (
    <div class="flex flex-1 flex-col items-center justify-center text-slate-3">
      <div>{t(lang, "empty")}</div>
    </div>
  );
}

function Waiting() {
  return (
    <div class="flex flex-1 items-center justify-center text-slate-3">
      <div class="scale-300">
        <svg
          class="waiting scale-150"
          width="1rem"
          height="1rem"
          viewBox="0 0 30 30"
        >
          <circle
            cx="15"
            cy="15"
            r="12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
  );
}

const ko = {
  empty: "검색된 내용이 없습니다",
  search: "검색",
  searchContent: "검색어를 입력하세요",
} satisfies Record<string, string>;
const en = {
  empty: "Nothing found",
  search: "Search",
  searchContent: "Search content",
} satisfies typeof ko;
function t(lang: string, key: keyof typeof ko): string {
  if (lang === "ko") return ko[key];
  return en[key];
}
