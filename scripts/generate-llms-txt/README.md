# llms.txt 생성 스크립트

이 디렉터리에는 MDX 파일을 마크다운으로 변환하고 llms.txt 파일을 생성하는 스크립트가 포함되어 있습니다.

## 파일 구조

- `index.ts`: 메인 스크립트 파일
- `mdx-parser.ts`: MDX 파일을 파싱하는 함수
- `mdx-to-markdown.ts`: MDX를 마크다운으로 변환하는 함수

## 기능

이 스크립트는 다음과 같은 기능을 제공합니다:

1. MDX 파일을 파싱하여 frontmatter, slug, 파일 경로, imports, AST를 추출
2. SolidJS 커스텀 컴포넌트를 마크다운으로 변환
3. 변환된 마크다운 파일을 `public/llms/` 디렉터리에 저장
4. llms.txt, llms-full.txt, llms-small.txt 파일 생성

## 지원하는 SolidJS 커스텀 컴포넌트

- Figure: 이미지와 캡션으로 변환
- Hint: 이모지와 함께 블록 인용구로 변환
- Tabs: 탭 제목과 내용을 순차적으로 나열
- Details: 제목과 내용 순서대로 표시
- ContentRef: 링크로 변환
- VersionGate: 버전 정보와 함께 내용 표시
- Youtube: 유튜브 링크로 변환
- Parameter: 생략
- Swagger 관련 컴포넌트: 생략

## 사용법

```bash
pnpm generate-llms-txt
```

이 명령어는 모든 MDX 파일을 마크다운으로 변환하고, llms.txt, llms-full.txt, llms-small.txt 파일을 생성합니다. 
