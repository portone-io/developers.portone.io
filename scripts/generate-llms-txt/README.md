# llms.txt 생성 스크립트

이 디렉터리에는 MDX 파일을 마크다운으로 변환하고 [llms.txt 표준](https://llmstxt.org/)에 맞게 llms.txt, llms-full.txt, llms-small.txt 파일을 생성하는 스크립트가 포함되어 있습니다.

## 파일 구조

- `index.ts`: 메인 스크립트 파일로, 실행 흐름을 관리
- `generator.ts`: 마크다운 생성 및 llms.txt 파일 생성 로직을 포함
- `mdx-parser.ts`: MDX 파일을 파싱하는 함수들을 포함
- `mdx-to-markdown/`: MDX를 마크다운으로 변환하는 모듈
  - `index.ts`: AST 변환 및 마크다운 생성 핵심 로직
  - `jsx/`: 각 커스텀 컴포넌트별 변환 로직을 포함한 모듈들
    - `index.ts`: JSX 요소 처리를 위한 메인 함수 및 컴포넌트 라우팅
    - `common.ts`: 공통 유틸리티 함수들
    - `figure.ts`, `hint.ts`, `tabs.ts` 등: 각 컴포넌트별 변환 로직

## 기능

이 스크립트는 다음과 같은 기능을 제공합니다:

1. MDX 파일을 파싱하여 frontmatter, slug, 파일 경로, imports, AST를 추출
2. SolidJS 커스텀 컴포넌트를 마크다운으로 변환
3. 변환된 마크다운 파일을 `public/markdown/` 디렉터리에 저장
4. 다음 세 가지 형식의 파일 생성:
   - `llms.txt`: 모든 문서의 링크와 설명을 카테고리별로 정리한 파일
   - `llms-full.txt`: `llms.txt`의 내용과 함께 모든 문서의 전체 내용을 포함
   - `llms-small.txt`: `llms.txt`와 동일한 내용 (문서 링크와 설명만 포함)

## 파일 생성 로직

### parseAllMdxFiles

- `src/routes/` 디렉터리에서 모든 MDX 파일을 찾아 파싱
- 각 파일의 frontmatter, slug, 파일 경로, imports, AST를 추출하여 맵으로 반환

### transformAllMdxToAst

- 파싱된 MDX 파일들의 AST를 마크다운용 AST로 변환
- SolidJS 커스텀 컴포넌트를 표준 마크다운 구문으로 변환

### saveMarkdownFiles

- 변환된 AST를 마크다운 문자열로 변환하여 `public/markdown/` 디렉터리에 저장
- 각 MDX 파일에 대응하는 마크다운 파일을 생성

### generateLlmsTxtFiles

- `llms.txt` 생성:
  - 모든 문서를 카테고리별로 정리 (공통, V1, V2, 파트너정산, 릴리스 노트, 블로그)
  - 각 문서의 링크와 설명을 포함
  - 문서 frontmatter의 `targetVersions` 필드를 기준으로 분류
- `llms-full.txt` 생성:
  - `llms.txt`의 내용을 포함
  - 모든 문서의 전체 내용을 추가 (마크다운 형식)
- `llms-small.txt` 생성:
  - `llms.txt`와 동일한 내용으로 생성 (링크와 설명만 포함)

### MDX-to-Markdown 변환 로직

#### transformAstForMarkdown

- MDX AST를 마크다운용 AST로 변환하는 핵심 함수
- 다음 처리를 순차적으로 수행:
  1. JSX 컴포넌트를 마크다운으로 변환 (transformJsxComponents)
  2. 임포트 구문 제거 (removeImports)
  3. YAML 노드 제거 (removeYamlNodes)
  4. 남은 JSX 노드 단순화 (simplifyJsxNodes)
  5. MDX 표현식 노드 처리 (handleRemainingMdxFlowExpressions)

#### astToMarkdownString

- 변환된 AST를 마크다운 문자열로 변환
- 프론트매터를 YAML 형식으로 추가 (thumbnail 필드 제외)
- GitHub Flavored Markdown 형식으로 출력 (remarkGfm 사용)
- 마크다운 형식 설정 (bullet, 강조, 들여쓰기, 테이블 등)

#### transformJsxComponents

- 모든 JSX 컴포넌트를 마크다운으로 변환하는 메인 함수
- AST를 순회하며 `mdxJsxFlowElement` 및 `mdxJsxTextElement` 타입의 노드를 처리
- 컴포넌트 이름에 따라 적절한 처리 함수로 라우팅
- 각 컴포넌트별 변환 로직은 별도 모듈에 구현 (figure.ts, hint.ts 등)
- 지원하지 않는 컴포넌트는 자식 노드만 유지하거나 제거

#### JSX 컴포넌트별 변환 동작

다음은 각 JSX 컴포넌트의 마크다운 변환 방식입니다:

- **Figure**: 이미지와 캡션을 텍스트로 변환

  ```markdown
  (이미지 첨부: 캡션 텍스트)
  ```

  또는 캡션이 없는 경우:

  ```markdown
  (관련 이미지 첨부)
  ```

- **Hint**: HTML `div` 태그로 힌트 스타일 유지

  ```html
  <div class="hint hint-[type]" data-attributes>힌트 내용</div>
  ```

- **Tabs**: HTML `div` 태그를 사용해 탭 구조 유지

  ```html
  <div class="tabs-container">
    <div class="tabs-content" data-title="탭1 제목">탭1 내용</div>
    <div class="tabs-content" data-title="탭2 제목">탭2 내용</div>
  </div>
  ```

- **Details**: HTML `details` 및 `summary` 태그로 변환

  ```html
  <details>
    <summary>요약 내용</summary>
    상세 내용
  </details>
  ```

- **ContentRef**: 외부 문서에 대한 링크로 변환, 문서의 frontmatter에서 title 추출

  ```markdown
  [문서 제목](https://developers.portone.io/경로.md)
  ```

- **VersionGate**: HTML 주석을 사용하여 버전 특화 콘텐츠 표시

  ```html
  <!-- VERSION-SPECIFIC: V1 ONLY CONTENT START -->
  내용
  <!-- VERSION-SPECIFIC: V1 ONLY CONTENT END -->
  ```

- **Youtube**: 유튜브 링크를 일반 링크로 변환
  ```markdown
  [캡션 또는 "YouTube 비디오"](https://www.youtube.com/watch?v=VIDEO_ID)
  ```
- **ApiLink**: API 문서 링크로 변환

  ```markdown
  [API명 - METHOD /path](https://developers.portone.io/schema/openapi.yml)
  ```

- **Badge 컴포넌트** (PaymentV1, PaymentV2, Recon, Console, Partner): 각 뱃지 유형에 맞는 텍스트로 변환하고 굵게 표시

  ```markdown
  **결제 모듈 V1**
  **결제 모듈 V2**
  **PG 거래대사**
  **관리자 콘솔**
  **파트너 정산 자동화**
  ```

- **Swagger 관련 컴포넌트**:

  - Swagger: HTTP 메서드와 경로를 굵게 표시
    ```markdown
    **METHOD** /path
    _요약 설명_
    ```
  - SwaggerResponse: 응답 상태 코드와 설명 표시
    ```markdown
    **상태 코드** - 설명
    ```

- **code 요소**: 인라인 코드로 변환

  ```markdown
  `코드 내용`
  ```

- **prose 태그**: 해당하는 마크다운 구문으로 변환
  - prose.h1 → # 제목 (heading 깊이 1)
  - prose.h2 → ## 제목 (heading 깊이 2)
  - prose.h3 → ### 제목 (heading 깊이 3)
  - prose.p → 단락 (paragraph)
  - prose.blockquote → 인용문 (blockquote)
  - prose.ul → 순서 없는 목록 (unordered list)
  - prose.a → 링크 (link)

## 문서 분류 로직

문서는 다음 기준으로 분류됩니다:

1. 경로 접두사에 따른 분류:

   - `release-notes/`: 릴리스 노트
   - `blog/posts/`: 블로그
   - `api/`: API 문서
   - `sdk/`: SDK 문서
   - `platform/`: 파트너정산 문서

2. frontmatter의 `targetVersions` 필드에 따른 분류:
   - `["v1", "v2"]` 또는 빈 배열: 공통 문서
   - `["v1"]`: V1 전용 문서
   - `["v2"]`: V2 전용 문서
   - 기타: 공통 문서로 처리

## 지원하는 SolidJS 커스텀 컴포넌트

다음 커스텀 컴포넌트들이 마크다운으로 적절히 변환됩니다:

- `<Figure>`: 이미지와 캡션으로 변환
- `<Hint>`: 이모지와 함께 블록 인용구로 변환 (타입에 따라 다른 이모지 사용)
- `<Tabs>`: 각 탭의 제목과 내용을 순차적으로 나열
- `<Details>`: 제목과 내용을 마크다운 형식으로 변환
- `<VersionGate>`: 버전 정보와 함께 내용을 마크다운으로 표시
- `<ContentRef>`: 외부 문서에 대한 링크로 변환
- `<Youtube>`: 유튜브 링크로 변환
- `<ApiLink>`: API 문서 링크로 변환
- `<EasyGuideLink>`: 처리 생략
- `<Parameter>`: API 파라미터 정보를 마크다운 형식으로 변환
- Swagger 관련 컴포넌트: 인라인 코드 또는 코드 블록으로 변환

## 사용법

```bash
pnpm generate-llms-txt
```

이 명령어는 모든 MDX 파일을 마크다운으로 변환하고, llms.txt, llms-full.txt, llms-small.txt 파일을 생성합니다.

## 출력 파일

- 개별 마크다운 파일: `public/markdown/{slug}.md`
- llms.txt 파일들:
  - `public/llms.txt`: 문서 목록과 링크
  - `public/llms-full.txt`: 모든 문서의 전체 내용
  - `public/llms-small.txt`: `llms.txt`와 동일한 내용

