# LLM Assistant, MCP 서버를 만들기 위한 용도의 마크다운 컨텐츠 추출 스크립트 작성하기

## 요구사항

- `pnpm generate-docs-for-llms` 스크립트를 구현해야 함
  - 해당 스크립트는 Custom GPT 또는 MCP 서버가 가장 활용하기 좋은 형태로 마크다운 파일들을 가지는 디렉터리를 생성함.
  - directory path는 project root 기준 `docs-for-llms/` 사용
  - 해당 디렉터리는 .gitignore에 등록되어 version tracking되지 않아야 함
- `pnpm generate-docs-for-llms` 는 `pnpm generate-llms-txt`의 마크다운 변환 로직을 공통으로 사용하는 형태로 구현되어야 함.
  - 그러나, `pnpm generate-llms-txt`가 컨텐츠 내부 링크에 markdown file link를 사용하는 것과 달리 개발자센터 웹페이지 링크를 생성하도록 해야한다는 점이 다름.
    - 즉 `<ContentRef>` 등 링크로 변환되는 JSX 컴포넌트의 처리 방식이 달라져야 함. `ContentRef.tsx` 등 기존 코드 구현을 참고해 작성할 필요가 있음.
  - 이는 `pnpm generate-llms-txt` 로직 실행 후 후처리로 구현되는 것이 아니라, 마크다운 변환 로직에 option flag를 제공함으로써 `pnpm generate-llms-txt` `pnpm generate-docs-for-llms` 각각의 스크립트에서 다르게 생성하도록 처리되어야 함
  - 단, 애초부터 mdx 형태에서부터 마크다운 형식 링크로 존재하는 것들 중 `https://developers.portone.io/` 가 생략된 링크는 후처리를 통해 `https://developers.portone.io/`를 path prefix로 붙여줘야 함
  - `pnpm generate-docs-for-llms`와 `pnpm generate-llms-txt`가 함께 사용하는 공통 로직은 완성 후 `scripts/` 내 별도 디렉터리로 빼내어도 좋음
- `pnpm generate-docs-for-llms` 실행 시 `pnpm generate-llms-txt`에서 생성하던 `public/markdown` 하위 디렉터리와 동일한 구조로 `docs-for-llms/` 하위에 마크다운 파일들이 생성되어야 함
- `pnpm generate-docs-for-llms` 실행 시 `pnpm generate-llms-txt`에서 생성하던 `llms.txt` 파일과 동일한 내용의 `README.md` 파일이 `docs-for-llms/` 하위에 존재해야 함
- `pnpm generate-docs-for-llms` 실행 시 `docs-for-llms/v1-docs-full.md` 가 생성되어야 함. 해당 문서는 V1 & V2 공통문서와 V1 전용 문서들을 모두 합친 내용으로 구성됨.
  - `pnpm generate-llms-txt` 에서 `llms-full.txt`를 생성하는 것과 비슷하나, 공통문서 및 V1 문서만 포함하도록 생성
- `pnpm generate-docs-for-llms` 실행 시 `docs-for-llms/v2-docs-full.md` 가 생성되어야 함. 해당 문서는 V1 & V2 공통문서와 V2 전용 문서들을 모두 합친 내용으로 구성됨.
  - `pnpm generate-llms-txt` 에서 `llms-full.txt`를 생성하는 것과 비슷하나, 공통문서 및 V2 문서만 포함하도록 생성

## 작업내용 (이곳에 완료된 작업내용 추가)
