/* @jsxImportSource solid-js */

import { clsx } from "clsx";
import Fuse from "fuse.js";
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { lazy } from "~/misc/async";
import { systemVersion } from "~/state/nav";
import type { NavMenuSystemVersions } from "~/state/server-only/nav";

export interface SearchButtonProps {
  lang: string;
}
export function SearchButton(props: SearchButtonProps) {
  return (
    <button
      type="button"
      class="border-slate-3 bg-slate-1 text-slate-4 border-1 rounded-6px mx-2 flex flex-1 gap-2 p-2"
      onClick={openSearchScreen}
    >
      <i class="i-ic-baseline-search text-2xl" />
      <span>{t(props.lang, "search")}</span>
    </button>
  );
}

export const [isSearchOpen, setIsSearchOpen] = createSignal(false);
export const [searchText, setSearchText] = createSignal("");
export const searchIndexKo = lazy(() => fetchSearchIndex("ko"));
export const searchIndexEn = lazy(() => fetchSearchIndex("en"));
async function fetchSearchIndex(lang: string): Promise<SearchIndex> {
  const res = await fetch(`/content-index/docs-${lang}.json`);
  return JSON.parse(((await res.text()) as string).normalize("NFKD"));
}

export type SearchIndex = SearchIndexItem[];
export interface SearchIndexItem {
  slug: string;
  title?: string;
  description?: string;
  text: string;
}
export const [searchIndex, setSearchIndex] = createSignal<
  SearchIndex | undefined
>(undefined);
export const fuse = createMemo(() => {
  const index = searchIndex();
  if (!index) return;
  const filteredIndex = index.filter((item) => {
    const navMenuSystemVersion =
      navMenuSystemVersions()[item.slug.replace(/^docs/, "")];
    if (!navMenuSystemVersion || navMenuSystemVersion === "all") return true;
    return navMenuSystemVersion === systemVersion();
  });
  return new Fuse(filteredIndex, { keys: ["title", "description", "text"] });
});
export const [navMenuSystemVersions, setNavMenuSystemVersions] =
  createSignal<NavMenuSystemVersions>({});
export const searchResult = createMemo(() => {
  const text = searchText();
  const f = fuse();
  if (!text || !f) return [];
  return f.search(text.normalize("NFKD"));
});

export function openSearchScreen() {
  setIsSearchOpen(true);
}
export function closeSearchScreen() {
  setIsSearchOpen(false);
  document.body.focus();
}

export interface SearchScreenProps {
  lang: string;
  navMenuSystemVersions: NavMenuSystemVersions;
}
export function SearchScreen(props: SearchScreenProps) {
  let inputRef: HTMLInputElement | undefined;
  const className = createMemo(() =>
    clsx(
      "fixed left-0 top-0 z-10 h-full w-full transition bg-[rgba(0,0,0,0.6)]",
      isSearchOpen() ? "backdrop-blur-sm" : "pointer-events-none opacity-0",
    ),
  );
  createEffect(() => {
    setNavMenuSystemVersions(props.navMenuSystemVersions);
  });
  createEffect(() => {
    const isOpen = isSearchOpen();
    if (!isOpen) return;
    inputRef?.focus();
    const searchIndexPromise =
      props.lang === "ko" ? searchIndexKo : searchIndexEn;
    searchIndexPromise.then((searchIndex) => setSearchIndex(searchIndex));
  });
  return (
    <div class={className()} onClick={closeSearchScreen}>
      <div
        class="sm:mt-18 sm:w-150 sm:max-h-1/2 mx-auto flex h-full w-full flex-col border bg-white sm:min-h-80 sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex">
          <input
            class="flex-1 bg-transparent p-4"
            ref={inputRef as HTMLInputElement}
            placeholder={t(props.lang, "searchContent")}
            value={searchText()}
            onInput={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSearchScreen();
            }}
          />
          <button
            type="button"
            class="px-4 sm:hidden"
            onClick={closeSearchScreen}
          >
            <i class="i-ic-baseline-close block text-2xl" />
          </button>
        </div>
        <div class="flex flex-1 flex-col overflow-y-auto border-t">
          <Switch fallback={<Waiting />}>
            <Match when={searchResult().length}>
              <ul>
                <For each={searchResult()}>
                  {(result) => (
                    <a href={`/${result.item.slug}`} tabIndex={0}>
                      <li class="hover:bg-slate-1 px-4 py-2">
                        <div class="text-sm">{result.item.title}</div>
                        <Show when={result.item.description}>
                          <div class="text-slate-4 text-xs">
                            {result.item.description}
                          </div>
                        </Show>
                      </li>
                    </a>
                  )}
                </For>
              </ul>
            </Match>
            <Match when={fuse}>
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
function Empty(props: EmptyProps) {
  return (
    <div class="text-slate-3 flex flex-1 flex-col items-center justify-center">
      <div>{t(props.lang, "empty")}</div>
    </div>
  );
}

function Waiting() {
  return (
    <div class="text-slate-3 flex flex-1 items-center justify-center">
      <div class="scale-300">
        <svg
          class="waiting scale-150"
          width="1rem"
          height="1rem"
          viewBox="0 0 30 30"
        >
          <title>A loading indicator</title>
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
