# developers.portone.io

PortOne 개발자센터 저장소입니다.

## 문서 수정하기

개발자센터의 문서는 [MDX](https://mdxjs.com/) 형식으로 작성되어 있습니다.\
`src/content/docs/[lang]/[...slug].mdx` 경로의 파일을 열어서 수정해주시면 됩니다.\
`src/content/docs/[lang]/_nav.yaml` 파일을 열어서 좌측 네비게이션 메뉴 항목을 수정할 수 있습니다.

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
pnpm dev # http://localhost:3000/ 접속
```
