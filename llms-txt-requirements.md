# llms.txt를 지원하기 위한 추가 요구사항 정리

## 이미 구현된 부분

현재까지 프로젝트 내 존재하는 모든 mdx파일을 markdown 형식으로 바꾸고, 해당 public/llms/ 내 각각의 mdx filepath에 상응하는 경로에 배치하는 것까지 잘 구현되었음
또 이를 바탕으로 한 llms-full.txt, llms-small.txt도 생성하고 있음

llms.txt 표준에 맞는 파일이 `/llms.txt` 경로에 생성되었으며, llms-full.txt와 llms-small.txt의 경로도 각각 `/llms-full.txt`, `/llms-small.txt`로 변경되었습니다. 또한 Metadata 컴포넌트에서 이러한 변경사항이 반영되어 올바른 경로로 링크가 제공됩니다.

## 추가 요구사항
