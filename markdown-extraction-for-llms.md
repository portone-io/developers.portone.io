# LLM Assistant, MCP 서버를 만들기 위한 용도의 마크다운 컨텐츠 추출 스크립트 작성하기

## 요구사항

- `pnpm generate-docs-for-llms` 스크립트를 구현해야 함
  - 해당 스크립트는 Custom GPT 또는 MCP 서버가 가장 활용하기 좋은 형태로 마크다운 파일들을 가지는 디렉터리를 생성함.
  - directory path는 project root 기준 `docs-for-llms/` 사용
  - 해당 디렉터리는 .gitignore에 등록되어 version tracking되지 않아야 함
- `pnpm generate-docs-for-llms` 는 `scripts/mdx-to-markdown` 하위의 마크다운 변환 로직을 사용하는 형태로 구현되어야 함.
  - `pnpm generate-llms-txt` 또한 `scripts/mdx-to-markdown`을 사용하고 있음
  - 그러나, `pnpm generate-llms-txt`가 컨텐츠 내부 링크에 markdown file link를 사용하는 것과 달리 개발자센터 웹페이지 링크를 생성하도록 해야한다는 점이 다름.
    - 즉 `<ContentRef>` 등 링크로 변환되는 JSX 컴포넌트의 처리 방식이 달라져야 함.
  - 이는 `pnpm generate-llms-txt` 로직 실행 후 후처리로 구현되는 것이 아니라, 마크다운 변환 로직에 함수 파라미터로 flag를 제공함으로써 `pnpm generate-llms-txt` `pnpm generate-docs-for-llms` 각각의 스크립트에서 다르게 생성하도록 처리되어야 함
    - 마크다운 파일 링크로 변환하는 옵션과, 개발자센터 웹페이지 링크로 변환하는 옵션
  - 단, 애초부터 mdx 형태에서부터 마크다운 형식 링크로 존재하는 것들 중 `https://developers.portone.io/` 가 생략된 링크는 후처리를 통해 `https://developers.portone.io/`를 path prefix로 붙여줘야 함
  - `pnpm generate-docs-for-llms`와 `pnpm generate-llms-txt`가 함께 사용하는 공통 로직은 완성 후 `scripts/` 내 별도 디렉터리로 빼내어도 좋음
- `pnpm generate-docs-for-llms` 실행 시 `pnpm generate-llms-txt`에서 생성하던 `public/markdown` 하위 디렉터리와 동일한 구조로 `docs-for-llms/` 하위에 마크다운 파일들이 생성되어야 함
- `pnpm generate-docs-for-llms` 실행 시 `pnpm generate-llms-txt`에서 생성하던 `llms.txt` 파일과 동일한 내용의 `README.md` 파일이 `docs-for-llms/` 하위에 존재해야 함
- `pnpm generate-docs-for-llms` 실행 시 `docs-for-llms/v1-docs-full.md` 가 생성되어야 함. 해당 문서는 V1 & V2 공통문서와 V1 전용 문서들을 모두 합친 내용으로 구성됨.
  - `pnpm generate-llms-txt` 에서 `llms-full.txt`를 생성하는 것과 비슷하나, 공통문서 및 V1 문서만 포함하도록 생성
  - 문서 상단에 등장하는 문서 링크 리스트에서도 v2 전용 컨텐츠는 제거되어야 함
- `pnpm generate-docs-for-llms` 실행 시 `docs-for-llms/v2-docs-full.md` 가 생성되어야 함. 해당 문서는 V1 & V2 공통문서와 V2 전용 문서들을 모두 합친 내용으로 구성됨.
  - `pnpm generate-llms-txt` 에서 `llms-full.txt`를 생성하는 것과 비슷하나, 공통문서 및 V2 문서만 포함하도록 생성
  - 문서 상단에 등장하는 문서 링크 리스트에서도 v1 전용 컨텐츠는 제거되어야 함

## 작업내용 (이곳에 완료된 작업내용 추가)
1. `scripts/generate-docs-for-llms/generator.ts` 파일 구현
   - MDX 파일을 파싱하고 마크다운으로 변환하는 로직 구현
   - 내부 링크를 개발자센터 웹페이지 링크로 변환하는 옵션 추가 (`useMarkdownLinks` 파라미터)
   - 문서 카테고리별 필터링 및 버전별 분류 로직 구현
   - 마크다운 파일 생성 및 저장 기능 구현

2. 버전별 문서 파일 생성 기능 구현
   - `v1-docs-full.md`: V1 & V2 공통문서와 V1 전용 문서 포함
   - `v2-docs-full.md`: V1 & V2 공통문서와 V2 전용 문서 포함
   - 각 문서 파일에 목차와 문서 내용 포함

3. `README.md` 파일 생성 기능 구현
   - `llms.txt`와 동일한 내용으로 `docs-for-llms/` 디렉토리에 생성
   - 공통 문서, 버전별 문서, 파트너정산, 릴리스 노트, 블로그 섹션 포함

4. 문서 링크 처리 개선
   - 모든 내부 링크를 `https://developers.portone.io/` 접두사가 포함된 웹페이지 링크로 변환
   - 문서 설명이 있는 경우 링크에 설명 추가

5. 릴리즈 노트, 블로그, 파트너정산 컨텐츠 포함 기능 추가
   - `v1-docs-full.md`와 `v2-docs-full.md` 파일에 릴리즈 노트, 블로그, 파트너정산 컨텐츠 포함
   - 목차에도 해당 컨텐츠의 링크 추가

6. 디렉토리 구조 유지
   - `docs-for-llms/` 디렉토리 하위에 원본 MDX 파일과 동일한 구조로 마크다운 파일 생성
