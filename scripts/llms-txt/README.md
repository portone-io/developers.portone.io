# llms.txt 생성 스크립트

이 디렉터리에는 MDX 파일을 마크다운으로 변환하고 [llms.txt 표준](https://llmstxt.org/)에 맞게 llms.txt, llms-full.txt, llms-small.txt 파일을 생성하는 스크립트가 포함되어 있습니다.

- `index.ts`: 메인 스크립트 파일로, 실행 흐름을 관리
- `generator.ts`: llms.txt 관련 파일 생성 로직

## 사용법

```bash
pnpm llms-txt
```

이 명령어는 모든 MDX 파일을 마크다운으로 변환하고, 스키마 파일을 복사한 후 llms.txt, llms-full.txt, llms-small.txt 파일을 생성합니다.

## 동작

이 스크립트는 다음과 같은 동작을 수행합니다:

1. MDX 파일을 파싱하여 frontmatter, slug, 파일 경로, imports, AST를 추출
2. SolidJS 커스텀 컴포넌트를 마크다운으로 변환
3. 변환된 마크다운 파일을 `public/` 디렉터리에 저장
4. `public/schema` 디렉터리의 모든 파일을 `public/schema` 디렉터리로 복사
5. 다음 세 가지 형식의 파일 생성:
   - `llms.txt`: 모든 문서의 링크와 설명을 카테고리별로 정리한 파일
   - `llms-full.txt`: `llms.txt`의 내용과 함께 모든 문서의 전체 내용을 포함
   - `llms-small.txt`: `llms.txt`와 동일한 내용 (문서 링크와 설명만 포함)

## 파일 생성 로직

- `llms.txt` 생성:
  - 모든 문서를 카테고리별로 정리 (공통, V1, V2, 파트너정산, 릴리스 노트, 블로그)
  - 각 문서의 링크와 설명을 포함
  - 문서 frontmatter의 `targetVersions` 필드를 기준으로 분류
- `llms-full.txt` 생성:
  - `llms.txt`의 내용을 포함
  - 모든 문서의 전체 내용을 추가 (마크다운 형식)
- `llms-small.txt` 생성:
  - `llms.txt`와 동일한 내용으로 생성 (링크와 설명만 포함)

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

## 출력 파일

- 개별 마크다운 파일: `public/{slug}.md`
- 스키마 파일: `public/schema/{file}`
- llms.txt 파일들:
  - `public/llms.txt`: 문서 목록과 링크
  - `public/llms-full.txt`: 모든 문서의 전체 내용
  - `public/llms-small.txt`: `llms.txt`와 동일한 내용

위 파일들은 배포 시 정적 리소스로 사용자가 접근할 수 있습니다.
