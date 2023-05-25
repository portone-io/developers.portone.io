import * as React from "react";
import { signal } from "@preact/signals";

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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const className = `fixed left-0 top-0 z-10 h-full w-full transition bg-[rgba(0,0,0,0.6)] ${
    searchScreenOpen ? "backdrop-blur-sm" : "pointer-events-none opacity-0"
  }`;
  React.useEffect(() => {
    if (!searchScreenOpen) return;
    inputRef.current?.focus();
  }, [searchScreenOpen]);
  return (
    <div class={className} onClick={closeSearchScreen}>
      <div
        class="mt-18 w-150 mx-auto flex flex-col rounded-lg border bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          class="bg-transparent p-4"
          ref={inputRef}
          placeholder={t(lang, "searchContent")}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeSearchScreen();
          }}
        />
        <div class="border-t">
          <Empty lang={lang} />
        </div>
      </div>
    </div>
  );
};

export interface EmptyProps {
  lang: string;
}
const Empty: React.FC<EmptyProps> = ({ lang }) => {
  return <div class="text-slate-3 py-20 text-center">{t(lang, "empty")}</div>;
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
