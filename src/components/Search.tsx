import { Search as KobalteSearch } from "@kobalte/core/search";
import Fuse from "fuse.js";
import { createResource, createSignal, Match, onMount, Switch } from "solid-js";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  section: string;
}

const createFuse = (terms: SearchResult[]): Fuse<SearchResult> => {
  return new Fuse(terms, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "content", weight: 0.3 },
      { name: "section", weight: 0.2 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: false,
  });
};

const extractTermsFromPage = (): SearchResult[] => {
  const terms: SearchResult[] = [];

  const elements = document.querySelectorAll(
    "article h2, article h3, article p",
  );

  let currentSection = "기타";
  let currentTerm: SearchResult | null = null;

  for (const element of elements) {
    if (element.tagName === "H2") {
      if (currentTerm) {
        terms.push(currentTerm);
        currentTerm = null;
      }
      currentSection = element.textContent?.trim() || "기타";
    } else if (element.tagName === "H3") {
      if (currentTerm) {
        terms.push(currentTerm);
      }
      currentTerm = {
        id: element.id,
        title: element.textContent?.trim() || "",
        content: "",
        section: currentSection,
      };
    } else if (element.tagName === "P" && currentTerm) {
      currentTerm.content += ` ${element.textContent?.trim() || ""}`.trim();
    }
  }

  if (currentTerm) {
    terms.push(currentTerm);
  }

  return terms;
};

export default function Search() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [fuse, setFuse] = createSignal<Fuse<SearchResult>>(new Fuse([]));
  const [searchResult] = createResource<SearchResult[], string>(
    searchTerm,
    (term) =>
      fuse()
        .search(term)
        .map((result) => ({
          ...result.item,
        })),
    {
      initialValue: [],
    },
  );

  onMount(() => {
    setFuse(createFuse(extractTermsFromPage()));
  });

  const scrollToTerm = (termId: string) => {
    document.getElementById(termId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <KobalteSearch
      class="mb-8 w-1/2"
      triggerMode="input"
      placeholder="용어를 검색하세요..."
      options={searchResult() ?? []}
      onInputChange={(input) => setSearchTerm(input.trim())}
      onChange={(value) => value && scrollToTerm(value.id)}
      optionValue="id"
      optionLabel="title"
      debounceOptionsMillisecond={100}
      sameWidth
      itemComponent={(props) => {
        return (
          <KobalteSearch.Item
            item={props.item}
            class="grid grid-rows-[auto_auto_auto] gap-1 border-b border-gray-100 rounded-md px-5 py-3 text-left transition-colors duration-150 last:border-b-0 hover:bg-gray-50"
          >
            <KobalteSearch.ItemLabel class="text-gray-900 font-medium">
              {props.item.rawValue.title}
            </KobalteSearch.ItemLabel>
            <KobalteSearch.ItemDescription class="text-sm text-gray-600">
              {props.item.rawValue.section}
            </KobalteSearch.ItemDescription>
            <KobalteSearch.ItemDescription class="line-clamp-2 text-sm text-gray-500">
              {props.item.rawValue.content}
            </KobalteSearch.ItemDescription>
          </KobalteSearch.Item>
        );
      }}
    >
      <KobalteSearch.Control class="relative">
        <KobalteSearch.Input class="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500" />
        <KobalteSearch.Indicator class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <KobalteSearch.Icon>
            <i class="i-ic-baseline-search block h-5 w-5 text-gray-400"></i>
          </KobalteSearch.Icon>
        </KobalteSearch.Indicator>
      </KobalteSearch.Control>

      <KobalteSearch.Portal>
        <KobalteSearch.Content
          class="mt-2 max-h-96 max-w-[var(--kb-popper-anchor-width)] overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg z-sticky-layout"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Switch>
            <Match when={searchResult.loading === true}>
              <div class="p-4 text-center text-gray-500">검색 중...</div>
            </Match>
            <Match
              when={searchResult.loading === false && searchResult().length > 0}
            >
              <div class="mx-4 my-2 text-sm text-gray-600">
                {searchResult().length}개의 결과를 찾았습니다
              </div>
            </Match>
          </Switch>
          <KobalteSearch.Listbox class="flex flex-col flex-wrap" />
          <KobalteSearch.NoResult class="p-4 text-center text-gray-500">
            "{searchTerm()}"에 대한 검색 결과가 없습니다.
          </KobalteSearch.NoResult>
        </KobalteSearch.Content>
      </KobalteSearch.Portal>
    </KobalteSearch>
  );
}
