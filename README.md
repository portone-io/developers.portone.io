# developers.portone.io

PortOne 개발자센터 저장소입니다.

포트원 크루의 경우 다음의 문서도 같이 읽어주세요:

- [포트원 크루용 매뉴얼](./PORTONE_CREW.md)

## 문서 수정하기

[별도의 문서](./DOCS_GUIDE.md)를 참고해 주세요.

## 개발환경 구성하기

개발자센터는 [Astro][]와 [Preact][], [UnoCSS][] (with Tailwind plugin) 기술을 활용하여 개발됐습니다.\
[각 기술에 맞는 VSCode 확장](./.vscode/extensions.json)이 저장소에 설정돼있으니 가급적 VSCode에서 저장소 추천 에디터 확장을 전부 설치하고 문서 수정을 부탁드립니다.

[Astro]: https://astro.build/
[Preact]: https://preactjs.com/
[UnoCSS]: https://unocss.dev/

## 로컬에 띄워보기

[Node.js][]와 [pnpm][]을 설치하고 아래 명령을 실행합니다.

[Node.js]: https://nodejs.org/en
[pnpm]: https://pnpm.io/

```sh
pnpm install
pnpm dev # http://localhost:4321/ 접속
```
