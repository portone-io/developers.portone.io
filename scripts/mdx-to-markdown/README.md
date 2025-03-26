# MDX-to-Markdown 변환 모듈

이 모듈은 MDX 파일을 마크다운으로 변환하는 기능을 제공합니다. SolidJS 커스텀 컴포넌트를 마크다운 형식으로 변환하고, 프론트매터를 처리하는 등의 작업을 수행합니다.

## 파일 구조

- `index.ts`: AST 변환 및 마크다운 생성 핵심 로직
- `mdx-parser.ts`: MDX 파일을 파싱하는 함수들을 포함
- `jsx/`: 각 커스텀 컴포넌트별 변환 로직을 포함한 모듈들
  - `index.ts`: JSX 요소 처리를 위한 메인 함수 및 컴포넌트 라우팅
  - `common.ts`: 공통 유틸리티 함수들
  - `figure.ts`, `hint.ts`, `tabs.ts` 등: 각 컴포넌트별 변환 로직

## JSX 컴포넌트별 변환 동작

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
  - SwaggerDescription: API 설명을 마크다운 형식으로 변환
    ```markdown
    _API 설명 텍스트_
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

- **File**: 파일 다운로드 링크를 텍스트로 변환

  ```markdown
  (파일: 캡션 텍스트)
  ```

  또는 캡션이 없는 경우:

  ```markdown
  (파일 다운로드 링크)
  ```

- **img 태그**: 이미지 태그를 마크다운 링크로 변환

  ```markdown
  [이미지 설명](https://developers.portone.io/이미지/경로)
  ```

- **A 컴포넌트**: 링크를 HTML a 태그로 변환, 상대 경로에 자동으로 기본 URL 추가

  ```html
  <a href="https://developers.portone.io/경로" ...속성>링크 내용</a>
  ```

- **SDKParameter**: SDK 파라미터 정의를 마크다운 형식으로 변환

  ```markdown
  - 파라미터명?: 타입명
    [definition link](https://developers.portone.io/schema/browser-sdk.yml#/경로)
  ```

- **SDKChangelog**: SDK 변경 로그 링크로 변환

  ```markdown
  [SDK Changelog](https://developers.portone.io/sdk/ko/v2-sdk/changelog)
  ```

- **Parameter.TypeDef**: 파라미터 타입 정의를 마크다운 형식으로 변환

  ```markdown
  - 파라미터명?: 타입

    파라미터 설명

    - 부가 설명
  ```

- **Condition**: 조건부 콘텐츠를 HTML 주석으로 변환

  ```html
  <!-- CONDITIONAL CONTENT if 조건 START -->
  조건부 콘텐츠
  <!-- CONDITIONAL CONTENT if 조건 END -->
  ```

- **Section**: 섹션을 HTML 주석으로 변환하여 문서의 특정 부분을 표시

  ```html
  <!-- SECTION 섹션이름 START -->
  섹션 내용
  <!-- SECTION 섹션이름 END -->
  ```

- **기본 HTML 태그**: 일반적인 HTML 태그들을 그대로 HTML로 변환

  - br, table, thead, tbody, th, tr, td, ul, li, p, span, i, strong, a 등

  ```html
  <태그명 속성="값">내용</태그명>
  ```

- **래핑 요소**: 단순히 내용을 래핑하는 컴포넌트는 내용만 추출

  - Parameter, Parameter.Details, EasyGuideLink, center, div, figure, figcaption 등

- **임포트된 MDX 파일**: MDX 파일을 임포트해서 컴포넌트로 사용한 경우, 해당 MDX 파일의 내용으로 대체
