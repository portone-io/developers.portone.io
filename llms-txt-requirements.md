# llms.txt를 지원하기 위한 요구사항 정리

## 기능 설명

- 프로젝트 내 mdx 파일 중 필요한 것들을 markdown 형식으로 바꾸고, public/llms/ 내 각각의 mdx filepath에 상응하는 경로에 파일로 생성
- [llms.txt 표준](https://llmstxt.org/)에 맞게 llms.txt, llms-full.txt, llms-small.txt 또한 생성

## TODO List

- [x] 마크다운 변환에서 제외할 mdx 파일들 제외하기.
- [x] llms.txt 카테고리 섹션 개선하기
- [x] 문서별로 targetVersions 명시 안 된 것들 추가해주기
- [ ] 개별 마크다운 파일들 보면서 퀄리티 높이기
  - 커스텀 컴포넌트 태그들 잘 알맞게 처리하기
  - 이상한 부분들 찾아 고치기
- [ ] 태그들 사이 줄바꿈 등 포매팅 개선하기
- [ ] llms-full.txt, llms-small.txt로 찾아 합치는 부분 개선하기
  - full / small 어떻게 나눌지 고려하기
  - header depth 등 고려하기
- [ ] 마크다운 문서 내에서의 링크 고쳐주기. `llms/` path도 추가되어야함

## MDX 파일에서 활용되는 태그 목록

프로젝트 내 MDX 파일에서 사용되는 HTML 형식 태그는 다음과 같습니다.

### 커스텀 컴포넌트 태그

- [x] `<Figure>` - 이미지와 캡션을 표시하는 컴포넌트
- [x] `<Hint>` - 정보, 경고, 위험 등의 힌트를 표시하는 컴포넌트
- [x] `<Details>` - 접을 수 있는 세부 정보를 표시하는 컴포넌트
  - `<Details.Summary>` - 접힌 상태에서 보이는 요약 부분
  - `<Details.Content>` - 펼쳤을 때 보이는 내용 부분
- [x] `<Tabs>` - 탭 인터페이스를 제공하는 컴포넌트
  - `<Tabs.Tab>` - 개별 탭 컨텐츠
- [ ] `<ApiLink>` - API 문서 링크를 제공하는 컴포넌트
- [x] `<VersionGate>` - 특정 버전에 따라 컨텐츠를 조건부로 표시하는 컴포넌트
- [x] `<ContentRef>` - 다른 문서에 대한 참조를 제공하는 컴포넌트
- [ ] `<Parameter>` - API 파라미터를 표시하는 컴포넌트
- [ ] `<SwaggerDescription>` - Swagger API 설명을 표시하는 컴포넌트
- [x] `<prose.xxx>` - 프로즈 스타일 컴포넌트 패밀리
- [x] badges.txt

### 기본 HTML 태그

- `<a>` - 하이퍼링크
- `<ul>` - 순서 없는 목록
- `<li>` - 목록 항목
- `<br>` - 줄바꿈
- `<strong>` - 강조 텍스트
- `<em>` - 기울임꼴 텍스트
- `<code>` - 인라인 코드
- `<pre>` - 서식이 지정된 텍스트 블록
- `<table>` - 테이블
- `<tr>` - 테이블 행
- `<td>` - 테이블 셀
- `<th>` - 테이블 헤더 셀
- `<p>` - 단락
- `<div>` - 일반 컨테이너
- `<span>` - 인라인 컨테이너

### 특수 구문

- `<project-id>`, `<region-anme>`, `<dataset name>`, `<dataset-name>.<table_name>` 등 - 실제 태그가 아닌 변수나 자리 표시자로 사용됨

이러한 태그들은 MDX 파일에서 다양한 형태의 콘텐츠를 구조화하고 스타일링하는 데 사용되고 있습니다. 특히 커스텀 컴포넌트 태그들은 문서화 시스템에서 일관된 UI 요소를 제공하기 위해 사용되고 있습니다.
