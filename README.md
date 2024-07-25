# developers.portone.io

PortOne 개발자센터 저장소입니다.

포트원 크루의 경우 다음의 문서도 같이 읽어주세요:

- [포트원 크루용 매뉴얼](./PORTONE_CREW.md)

## 문서 수정하기

[별도의 문서](./DOCS_GUIDE.md)를 참고해 주세요.

## 개발환경 구성하기

개발자센터는 [SolidStart][]와 [UnoCSS][] (with Tailwind plugin) 등의 기술을 활용하여 개발됐습니다.\
[각 기술에 맞는 VSCode 확장](./.vscode/extensions.json)이 저장소에 설정돼있으니 가급적 VSCode에서 저장소 추천 에디터 확장을 전부 설치하고 문서 수정을 부탁드립니다.

[SolidStart]: https://docs.solidjs.com/solid-start
[UnoCSS]: https://unocss.dev/

## 로컬에 띄워보기

[Node.js][]와 [pnpm][]을 설치하고 아래 명령을 실행합니다.

[Node.js]: https://nodejs.org/en
[pnpm]: https://pnpm.io/

```sh
pnpm install
pnpm dev # http://localhost:4321/ 접속
```

--------

이 프로젝트는 [GNU Affero General Public License v3.0] 또는 그 이후 버전에 따라 라이센스가 부여됩니다. 자세한 내용은 [COPYRIGHT] 파일을 참고하세요.

[GNU Affero General Public License v3.0]: LICENSE
[COPYRIGHT]: COPYRIGHT
