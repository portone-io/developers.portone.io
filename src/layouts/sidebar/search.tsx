import * as React from "react";
import { computed, signal } from "@preact/signals";
import Fuse from "fuse.js";
import { lazy } from "~/misc/async";

export interface SearchButtonProps {
  lang: string;
}
export const SearchButton: React.FC<SearchButtonProps> = ({ lang }) => {
  return (
    <button
      class="bg-slate-2 text-slate-4 m-2 flex flex-1 gap-2 rounded p-2"
      onClick={openSearchScreen}
    >
      <i class="i-ic-baseline-search text-2xl"></i>
      <span>{t(lang, "search")}</span>
    </button>
  );
};

export const searchScreenOpenSignal = signal(false);
export const searchTextSignal = signal("");
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
export const searchIndexSignal = signal<SearchIndex | undefined>(undefined);
export const fuseSignal = computed(() => {
  const searchIndex = searchIndexSignal.value;
  if (!searchIndex) return;
  return new Fuse(searchIndex, { keys: ["title", "description", "text"] });
});
export const searchResultSignal = computed(() => {
  const searchText = searchTextSignal.value;
  const fuse = fuseSignal.value;
  if (!searchText || !fuse) return [];
  return fuse.search(searchText.normalize("NFKD"));
});

export function openSearchScreen() {
  searchScreenOpenSignal.value = true;
}
export function closeSearchScreen() {
  searchScreenOpenSignal.value = false;
  document.body.focus();
}

export interface SearchScreenProps {
  lang: string;
}
export const SearchScreen: React.FC<SearchScreenProps> = ({ lang }) => {
  const searchScreenOpen = searchScreenOpenSignal.value;
  const searchText = searchTextSignal.value;
  const fuse = fuseSignal.value;
  const searchResult = searchResultSignal.value;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const className = `fixed left-0 top-0 z-10 h-full w-full transition bg-[rgba(0,0,0,0.6)] ${
    searchScreenOpen ? "backdrop-blur-sm" : "pointer-events-none opacity-0"
  }`;
  React.useEffect(() => {
    if (!searchScreenOpen) return;
    inputRef.current?.focus();
    const searchIndexPromise = lang === "ko" ? searchIndexKo : searchIndexEn;
    searchIndexPromise.then(
      (searchIndex) => (searchIndexSignal.value = searchIndex)
    );
  }, [searchScreenOpen]);
  return (
    <div class={className} onClick={closeSearchScreen}>
      <div
        class="mt-18 w-150 min-h-80 max-h-1/2 mx-auto flex flex-col rounded-lg border bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          class="bg-transparent p-4"
          ref={inputRef}
          placeholder={t(lang, "searchContent")}
          value={searchText}
          onInput={(e) => (searchTextSignal.value = e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeSearchScreen();
          }}
        />
        <div class="flex flex-1 flex-col overflow-y-auto border-t">
          {searchResult.length ? (
            <ul>
              {searchResult.map(({ item }) => (
                <a href={`/${item.slug}`} tabIndex={0}>
                  <li key={item.slug} class="hover:bg-slate-1 px-4 py-2">
                    <div class="text-sm">{item.title}</div>
                    {item.description && (
                      <div class="text-slate-4 text-xs">{item.description}</div>
                    )}
                  </li>
                </a>
              ))}
            </ul>
          ) : fuse ? (
            <Empty lang={lang} />
          ) : (
            <Waiting />
          )}
        </div>
      </div>
    </div>
  );
};

interface EmptyProps {
  lang: string;
}
const Empty: React.FC<EmptyProps> = ({ lang }) => {
  return (
    <div class="text-slate-3 flex flex-1 flex-col items-center justify-center">
      <div>{t(lang, "empty")}</div>
    </div>
  );
};

const Waiting: React.FC = () => {
  return (
    <div class="text-slate-3 flex flex-1 items-center justify-center">
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
            strokeWidth="2"
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
  );
};

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
