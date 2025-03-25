import docsearch from "@docsearch/js";
import { onMount } from "solid-js";

import { useSystemVersion } from "~/state/system-version";

export default function SearchButton() {
  const { systemVersion } = useSystemVersion();

  onMount(() => {
    docsearch({
      appId: "VKHUPCEY04",
      apiKey: "aa5d14c514f0678f212ded80acaf6627",
      indexName: "developers-portone",
      container: "#algolia-search-button",
      translations: {
        button: {
          buttonText: "검색",
          buttonAriaLabel: "Search",
        },
      },
      searchParameters: {
        facetFilters: [`version:${systemVersion()}`],
      },
    });
  });

  return <div id="algolia-search-button" class="max-w-100 flex flex-1" />;
}
