import { createEffect, createSignal, For, onMount } from "solid-js";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  section: string;
  score?: number;
}

export default function Search() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [searchResults, setSearchResults] = createSignal<SearchResult[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);
  const [dictionaryTerms, setDictionaryTerms] = createSignal<SearchResult[]>(
    [],
  );

  // MDX 파일에서 자동으로 용어 추출하는 함수
  const extractTermsFromPage = (): SearchResult[] => {
    const terms: SearchResult[] = [];

    // 모든 h3 요소 (### 용어) 찾기
    const headings = document.querySelectorAll("h3");

    // 섹션 제목 찾기 (h2 요소)
    const sections = document.querySelectorAll("h2");
    const sectionMap = new Map<Element, string>();

    sections.forEach((section) => {
      const sectionText = section.textContent?.trim() || "";
      if (sectionText.includes("**") && sectionText.includes("**")) {
        const cleanSection = sectionText.replace(/\*\*/g, "").trim();
        sectionMap.set(section, cleanSection);
      }
    });

    headings.forEach((heading) => {
      const headingText = heading.textContent?.trim() || "";

      // 해당 헤딩이 속한 섹션 찾기
      let section = "기타";
      for (const [sectionElement, sectionName] of sectionMap) {
        if (
          sectionElement.compareDocumentPosition(heading) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ) {
          section = sectionName;
          break;
        }
      }

      // ID가 있는 div 찾기
      const idDiv = heading.nextElementSibling as HTMLElement;
      if (idDiv && idDiv.tagName === "DIV" && idDiv.id) {
        // 설명 텍스트 추출 (다음 p 태그들에서)
        let description = "";
        let nextElement = idDiv.nextElementSibling;

        while (
          nextElement &&
          nextElement.tagName !== "H3" &&
          nextElement.tagName !== "H2"
        ) {
          if (nextElement.tagName === "P") {
            description += (nextElement.textContent?.trim() || "") + " ";
          }
          nextElement = nextElement.nextElementSibling;
        }

        terms.push({
          id: idDiv.id,
          title: headingText,
          content: description.trim(),
          section: section,
        });
      }
    });

    return terms;
  };

  // 컴포넌트 마운트 시 용어 추출
  onMount(() => {
    // DOM이 완전히 로드된 후 실행
    setTimeout(() => {
      const extractedTerms = extractTermsFromPage();
      setDictionaryTerms(extractedTerms);
    }, 100);
  });

  // 백업용 용어 데이터 (자동 추출이 실패할 경우 사용)
  const fallbackTerms: SearchResult[] = [];

  // 띄어쓰기 제거 및 정규화 함수
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "") // 모든 공백 제거
      .replace(/[^\w가-힣]/g, ""); // 특수문자 제거 (한글, 영문, 숫자만 유지)
  };

  // 한국어 띄어쓰기 변형 생성 함수
  const generateSpacingVariations = (text: string): string[] => {
    const normalized = normalizeText(text);
    const variations = [normalized];

    // 2글자 이상인 경우 중간에 공백을 넣은 변형들 생성
    if (normalized.length >= 2) {
      for (let i = 1; i < normalized.length; i++) {
        variations.push(normalized.slice(0, i) + " " + normalized.slice(i)); // 공백 있는 버전
        variations.push(normalized.slice(0, i) + normalized.slice(i)); // 공백 없는 버전
      }
    }

    return [...new Set(variations)]; // 중복 제거
  };

  // 유사도 계산 함수 (띄어쓰기 변형 고려)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);

    // 정확한 매칭
    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // 부분 문자열 매칭 (높은 점수)
    if (s1.includes(s2)) {
      return 0.9 + (s2.length / s1.length) * 0.1;
    }
    if (s2.includes(s1)) {
      return 0.9 + (s1.length / s2.length) * 0.1;
    }

    // 띄어쓰기 변형 고려한 매칭
    const variations1 = generateSpacingVariations(str1);
    const variations2 = generateSpacingVariations(str2);

    for (const v1 of variations1) {
      for (const v2 of variations2) {
        if (v1 === v2) return 0.95;
        if (v1.includes(v2) || v2.includes(v1)) {
          return 0.85;
        }
      }
    }

    // 문자별 유사도 계산 (낮은 점수)
    let matches = 0;
    const minLength = Math.min(s1.length, s2.length);

    for (let i = 0; i < minLength; i++) {
      if (s1[i] === s2[i]) matches++;
    }

    const similarity = matches / Math.max(s1.length, s2.length);
    return similarity > 0.5 ? similarity * 0.7 : similarity * 0.5;
  };

  // 검색 로직
  createEffect(() => {
    const term = searchTerm().trim();
    if (term.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const terms =
      dictionaryTerms().length > 0 ? dictionaryTerms() : fallbackTerms;

    const results = terms
      .map((termData) => {
        const titleScore = calculateSimilarity(termData.title, term);
        const contentScore = calculateSimilarity(termData.content, term);
        const sectionScore = calculateSimilarity(termData.section, term);

        // 최고 점수를 해당 용어의 점수로 사용
        const maxScore = Math.max(titleScore, contentScore, sectionScore);

        return {
          ...termData,
          score: maxScore,
        };
      })
      .filter((item) => item.score > 0.2) // 20% 이상 유사한 것만 표시
      .sort((a, b) => b.score - a.score); // 점수 순으로 정렬

    setSearchResults(results);
    setIsSearching(false);
  });

  const handleSearch = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSearchTerm(target.value);
  };

  const scrollToTerm = (termId: string) => {
    const element = document.getElementById(termId);
    if (element) {
      // 헤더 높이를 동적으로 계산하되, 더 큰 고정값도 고려
      const header =
        document.querySelector("header") ||
        document.querySelector("[data-header]") ||
        document.querySelector(".header");
      const headerHeight = header ? header.getBoundingClientRect().height : 100;

      // 오프셋 사용 (헤더 + 네비게이션 + 여백)
      const extraOffset = 600;
      const totalOffset = Math.max(headerHeight + extraOffset, 400); // 최소 400px 오프셋 보장

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition), // 음수 방지
        behavior: "smooth",
      });

      // 스크롤 완료 후 하이라이트 효과
      setTimeout(() => {
        element.style.transition = "background-color 0.3s ease";
        element.style.backgroundColor = "#fef3c7"; // 연한 노란색
        // 2초 후 하이라이트 제거
        setTimeout(() => {
          element.style.backgroundColor = "";
        }, 2000);
      }, 500); // 스크롤 완료 대기

      // 검색 결과 초기화
      setSearchTerm("");
    }
  };

  return (
    <div class="mb-8 max-w-full w-1/2">
      <div class="relative">
        <input
          type="text"
          placeholder="용어를 검색하세요..."
          value={searchTerm()}
          onInput={handleSearch}
          class="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            class="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 검색 결과 */}
      {searchTerm().length > 0 && (
        <div class="mt-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
          {isSearching() ? (
            <div class="p-4 text-center text-gray-500">검색 중...</div>
          ) : searchResults().length > 0 ? (
            <div class="p-2">
              <div class="mb-2 px-2 text-sm text-gray-600">
                {searchResults().length}개의 결과를 찾았습니다
              </div>
              <For each={searchResults()}>
                {(result) => (
                  <button
                    onClick={() => scrollToTerm(result.id)}
                    class="w-full border-b border-gray-100 rounded-md p-3 text-left transition-colors duration-150 last:border-b-0 hover:bg-gray-50"
                  >
                    <div class="mb-1 text-gray-900 font-medium">
                      {result.title}
                    </div>
                    <div class="mb-1 text-sm text-gray-600">
                      {result.section}
                    </div>
                    <div class="line-clamp-2 text-sm text-gray-500">
                      {result.content}
                    </div>
                  </button>
                )}
              </For>
            </div>
          ) : (
            <div class="p-4 text-center text-gray-500">
              "{searchTerm()}"에 대한 검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
