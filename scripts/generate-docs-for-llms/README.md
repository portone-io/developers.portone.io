# generate-docs-for-llms

PortOne 개발자 문서를 LLM(Large Language Model)에 최적화된 형태로 변환하는 스크립트입니다.

## 기능

이 스크립트는 다음과 같은 기능을 수행합니다:

1. MDX 파일을 파싱하여 마크다운 형식으로 변환
2. 변환된 마크다운 파일을 `docs-for-llms` 디렉토리에 저장
3. 스키마 파일(OpenAPI, GraphQL)을 `docs-for-llms/schema` 디렉토리에 복사
4. 목차가 포함된 README.md 파일 생성
5. 버전별 전체 문서 파일(v1-docs-full.md, v2-docs-full.md) 생성

## 사용 방법

```bash
# 프로젝트 루트 디렉토리에서 실행
pnpm generate-docs-for-llms
```

## 출력 결과

스크립트 실행 후 다음과 같은 파일과 디렉토리가 생성됩니다:

- `docs-for-llms/`: 모든 변환된 문서가 저장되는 루트 디렉토리
  - `README.md`: 모든 문서의 목차와 링크가 포함된 파일
  - `v1-docs-full.md`: V1 API 관련 모든 문서가 통합된 파일
  - `v2-docs-full.md`: V2 API 관련 모든 문서가 통합된 파일
  - `schema/`: API 스키마 파일이 저장되는 디렉토리
    - `v1.openapi.yml`, `v1.openapi.json`: V1 API 스키마
    - `v2.graphql`, `v2.openapi.yml`, `v2.openapi.json`: V2 API 스키마
  - 각 문서별 마크다운 파일 (원본 경로 구조 유지)

## 문서 분류 방식

스크립트는 다음과 같은 기준으로 문서를 분류합니다:

1. **버전별 분류**:

   - V1 전용 문서: frontmatter의 `targetVersions`에 "v1"만 포함
   - V2 전용 문서: frontmatter의 `targetVersions`에 "v2"만 포함
   - 공통 문서: `targetVersions`가 비어있거나, "v1"과 "v2" 모두 포함

2. **카테고리별 분류**:
   - SDK 문서: `sdk/` 경로로 시작하는 문서
   - API 문서: `api/` 경로로 시작하는 문서
   - 릴리스 노트: `release-notes/` 경로로 시작하는 문서
   - 블로그: `blog/posts/` 경로로 시작하는 문서
   - 파트너정산: `platform/` 경로로 시작하는 문서
   - 기타 문서: 위 카테고리에 속하지 않는 문서

## 주요 함수

- `parseAllMdxFiles()`: MDX 파일을 파싱하여 결과를 맵으로 반환
- `transformAllMdxToAst()`: MDX 파일의 AST를 마크다운용 AST로 변환
- `saveMarkdownFiles()`: 변환된 AST를 마크다운 파일로 저장
- `generateDocsForLlms()`: docs-for-llms 디렉토리를 생성하고 마크다운 파일들을 저장

## 참고 사항

- 이 스크립트는 프로젝트 루트 디렉토리에서 실행해야 합니다.
- 스크립트 실행 전 필요한 의존성이 설치되어 있어야 합니다.
- 생성된 문서는 LLM에 최적화된 형태로, 웹 링크와 마크다운 형식을 유지합니다.
