# llms.txt를 지원하기 위한 추가 요구사항 정리

## 이미 구현된 부분

현재까지 프로젝트 내 존재하는 모든 mdx파일을 markdown 형식으로 바꾸고, 해당 public/llms/ 내 각각의 mdx filepath에 상응하는 경로에 배치하는 것까지 잘 구현되었음
또 이를 바탕으로 한 llms-full.txt, llms-small.txt도 생성하고 있음

llms.txt 표준에 맞는 파일이 `/llms.txt` 경로에 생성되었으며, llms-full.txt와 llms-small.txt의 경로도 각각 `/llms-full.txt`, `/llms-small.txt`로 변경되었습니다. 또한 Metadata 컴포넌트에서 이러한 변경사항이 반영되어 올바른 경로로 링크가 제공됩니다.

## 추가 요구사항

현재 mdx 파일을 파싱해 마크다운으로 변경하는 방식으로 `scripts/generate-llms-txt.ts`가 구현되었지만, 아래 내용처럼 SolidJS 커스텀 컴포넌트를 함께 사용하고 있기에 추후 확장이 용이한 구조로 개선되어야 해
이 컴포넌트들의 용례를 보면 알겠지만, mdx에서 import한 레퍼런스를 attribute로 넣고 활용하는 등의 예시가 있어서 단순 정규식 기반 구현만으로는 mdx -> md 변환이 어려운 상황이야.
현재 구현된 내용 중 정규식 활용을 모두 제거하고, AST를 활용하는 구조로 바꿔줘.
- 일단 개별 mdx를 파싱해 frontmatter, slug 및 파일 경로, imports, AST가 포함된 결과를 반환하는 함수를 먼저 작성하고
- 해당 함수를 활용해 기반으로 정규식 없이 구현을 재작성해줘.

## MDX 파일에서 활용되는 SolidJS 커스텀 컴포넌트 목록

### Figure (~/components/Figure.tsx)

- 이미지와 캡션을 표시하는 컴포넌트
- 블로그 포스트와 문서에서 이미지 표시에 자주 사용됨
- 일단 생략해도 무관

### Hint (~/components/Hint.tsx)

- 정보, 경고, 성공, 위험 메시지를 표시하는 컴포넌트
- 스타일: info, warning, success, danger
- 이모지 또는 위 스타일 워딩으로 대체

### Tabs (~/components/gitbook/Tabs.tsx)

- 탭 인터페이스를 제공하는 컴포넌트
- Tabs.Tab 하위 컴포넌트를 통해 각 탭의 내용을 정의
- title, content 그냥 순서대로 나열하기

### Details (~/components/gitbook/Details.tsx)

- 접을 수 있는 세부 정보 섹션을 제공하는 컴포넌트
- Details.Summary와 Details.Content 하위 컴포넌트 포함
- 제목, 내용 순서대로 보여주기

### ContentRef (~/components/gitbook/ContentRef.tsx)

- 다른 문서에 대한 참조 링크를 제공하는 컴포넌트
- 링크된 마크다운 파일 링크로 대체

### VersionGate (~/components/gitbook/VersionGate.tsx)

- 시스템 버전에 따라 콘텐츠를 조건부로 표시하는 컴포넌트
- v1 또는 v2 버전에 따라 다른 내용 표시

### Youtube (~/components/gitbook/Youtube.tsx)

- YouTube 비디오를 임베드하는 컴포넌트
- 링크로 대체

### Parameter (~/components/parameter/Parameter.tsx)

- API 파라미터 정보를 표시하는 컴포넌트
- Parameter.TypeDef, Parameter.Details 하위 컴포넌트 포함
- 일단 생략

### Swagger 관련 컴포넌트 (~/components/gitbook/swagger/)

- Swagger: API 엔드포인트 정보를 표시
- SwaggerDescription: API 설명 표시
- SwaggerParameter: API 파라미터 정보 표시
- 일단 생략
