import { A } from "@solidjs/router";
import Fuse from "fuse.js";
import {
  createContext,
  createEffect,
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
import { match } from "ts-pattern";

import { lazy } from "~/misc/async";
import type { IndexFilesMapping } from "~/misc/contentIndex";
import type { NavMenuSystemVersions } from "~/state/nav";
import { useSystemVersion } from "~/state/system-version";

const BEFORE_KEYWORD_TEXT_LENGTH = 50;

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

const ctrlKey = () =>
  typeof navigator !== "undefined" &&
  navigator.platform &&
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
    ? "⌘"
    : "Ctrl";

export interface SearchButtonProps {
  lang: string;
}
export function SearchButton({ lang }: SearchButtonProps) {
  const { setOpen } = useSearchContext();

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <button
      class="max-w-100 flex flex-1 items-center gap-1.5 border-1 border-slate-3 rounded-6px px-3 py-1.5 text-slate-4"
      onClick={() => setOpen(true)}
    >
      <i class="i-ic-baseline-search text-2xl"></i>
      <span>{t(lang, "search")}</span>
      <kbd class="ml-auto flex gap-1 border border-slate-2 rounded-6px px-1.5 py-.5">
        <kbd class="text-xs">{ctrlKey()}</kbd>
        <kbd class="text-xs">K</kbd>
      </kbd>
    </button>
  );
}

export const searchIndexKo = lazy(() => fetchSearchIndex("ko"));
export const searchIndexEn = lazy(() => fetchSearchIndex("en"));
export const searchIndexBlog = lazy(() => fetchSearchIndex("blog"));
async function fetchSearchIndex(
  fileName: keyof IndexFilesMapping,
): Promise<SearchIndex> {
  const res = await fetch(`/content-index/${fileName}.json`);
  return JSON.parse((await res.text()).normalize("NFKD")) as SearchIndex;
}

export type SearchIndex = Record<string, SearchIndexItem[]>;
export interface SearchIndexItem {
  slug: string;
  title?: string;
  description?: string;
  text: string;
}

export interface SearchScreenProps {
  searchIndex: keyof IndexFilesMapping;
  navMenuSystemVersions: NavMenuSystemVersions;
}
export function SearchScreen(props: SearchScreenProps) {
  const { open, setOpen } = useSearchContext();
  const { systemVersion } = useSystemVersion();
  let inputRef: HTMLInputElement | undefined;

  const [searchText, setSearchText] = createSignal("");
  const [searchIndex] = createResource(
    () => open() && props.searchIndex,
    async (searchIndex) => {
      inputRef?.focus();
      return await match(searchIndex)
        .with("ko", () => searchIndexKo)
        .with("en", () => searchIndexEn)
        .with("blog", () => searchIndexBlog)
        .exhaustive();
    },
    { initialValue: undefined },
  );
  const fuse = createMemo(() => {
    const index = searchIndex.latest;
    if (!index) return;
    const filteredIndex = Object.entries(index)
      .flatMap(([key, value]) => value.map((item) => ({ ...item, key })))
      .filter((item) => {
        const navMenuSystemVersion =
          props.navMenuSystemVersions[`/${item.slug}`];
        if (!navMenuSystemVersion) return true;
        return navMenuSystemVersion === systemVersion();
      })
      .map((item) => {
        const slug = item.slug
          .replace(/\/index$/, "")
          // /foo/(bar)/baz -> /foo/baz
          .replace(/\/\([\w\d]+\)/, "");
        return { ...item, slug };
      });
    return new Fuse(filteredIndex, {
      keys: [
        {
          name: "title",
          weight: 3,
        },
        {
          name: "description",
          weight: 2,
        },
        {
          name: "text",
          weight: 1,
        },
      ],
      minMatchCharLength: 2,
      includeMatches: true,
      distance: 600,
    });
  });
  const searchResult = createMemo(() => {
    const text = searchText();
    const f = fuse();
    if (!text || !f) return [];
    return Map.groupBy(f.search(text.normalize("NFKD")), ({ item }) => item.key)
      .entries()
      .toArray();
  });

  const highlightedRegex = createMemo(
    () =>
      new RegExp(
        `([${searchText()}]${
          searchText().length > 1 ? `{2,${searchText().length}}` : ""
        })`,
        "i",
      ),
  );

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
        class="mx-auto h-full w-full flex flex-col gap-3 border bg-white p-3 sm:mt-18 sm:max-h-1/2 sm:min-h-80 sm:w-150 sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          class="flex items-center gap-1.5 border-1 border-slate-3 rounded-5 rounded-6px px-3 py-1.5 text-[15px] text-slate-4 shadow-sm"
          onClick={() => setOpen(true)}
        >
          <i class="i-ic-baseline-search text-xl"></i>
          <input
            class="flex-1 bg-transparent px-2 outline-none"
            ref={inputRef}
            placeholder={t(props.searchIndex, "searchContent")}
            value={searchText()}
            onInput={(e) => setSearchText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSearchScreen();
            }}
          />
        </div>
        <div class="flex flex-1 flex-col gap-1 overflow-y-auto">
          <Switch fallback={<Waiting />}>
            <Match when={searchResult().length > 0}>
              <For each={searchResult()}>
                {([key, value]) => (
                  <div>
                    <span class="text-sm text-slate-5 font-medium leading-4.5">
                      {key}
                    </span>
                    <ul>
                      <For each={value.slice(0, 3)}>
                        {({ item }) => {
                          const normalizedText = createMemo(() =>
                            item.text.normalize("NFKC"),
                          );
                          const keywordFirstIndex = createMemo(() =>
                            Math.max(normalizedText().indexOf(searchText()), 0),
                          );
                          const textStartIndex = createMemo(() =>
                            keywordFirstIndex() >= BEFORE_KEYWORD_TEXT_LENGTH
                              ? keywordFirstIndex() - BEFORE_KEYWORD_TEXT_LENGTH
                              : 0,
                          );
                          const contentDescription = createMemo(() =>
                            normalizedText().slice(
                              textStartIndex(),
                              textStartIndex() + 300,
                            ),
                          );
                          return (
                            <A
                              href={`/${item.slug}`}
                              tabIndex={0}
                              onClick={closeSearchScreen}
                            >
                              <li class="flex flex-col gap-.5 px-2 py-2 hover:bg-slate-1">
                                <div class="grid grid-cols-[max-content_1fr] items-center gap-1.5 overflow-hidden">
                                  <span class="text-sm text-slate-9 font-medium">
                                    {item.title}
                                  </span>
                                  <Show when={item.description}>
                                    <span class="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-5 leading-4">
                                      {item.description}
                                    </span>
                                  </Show>
                                </div>
                                <div class="line-clamp-2 text-ellipsis leading-[1.2]">
                                  <For
                                    each={contentDescription().split(
                                      highlightedRegex(),
                                    )}
                                  >
                                    {(text) => (
                                      <Switch
                                        fallback={
                                          <span class="text-[13px] text-slate-4">
                                            {text}
                                          </span>
                                        }
                                      >
                                        <Match
                                          when={highlightedRegex().test(text)}
                                        >
                                          <span class="text-[13px] text-portone">
                                            {text}
                                          </span>
                                        </Match>
                                      </Switch>
                                    )}
                                  </For>
                                </div>
                              </li>
                            </A>
                          );
                        }}
                      </For>
                    </ul>
                  </div>
                )}
              </For>
            </Match>
            <Match when={fuse()}>
              <Empty lang={props.searchIndex} />
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
