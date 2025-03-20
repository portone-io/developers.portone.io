import docsearch from "@docsearch/js";
import { onMount } from "solid-js";

export default function SearchButton() {
  onMount(() => {
    docsearch({
      appId: "VKHUPCEY04",
      apiKey: "aa5d14c514f0678f212ded80acaf6627",
      indexName: "developers-portone",
      container: "#algieba-search-button",
    });
  });

  return (
    <>
      <div id="algieba-search-button" />
    </>
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
