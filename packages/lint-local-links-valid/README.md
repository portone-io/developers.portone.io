## @portone-io/lint-local-links-valid

문서 링크가 실제 문서를 가리키는지 검사합니다.

- `remarkLintLocalLinksValid`: MDX 본문의 링크와 `ContentRef`를 검사하는 remark-lint 규칙입니다. `.remarkrc.js`에서 사용합니다.
- `navLocalLinksValid`, `redirLocalLinksValid`: `_nav.yaml`, `_redir.yaml`의 링크를 검사하는 YAML 규칙입니다. `lintYaml`로 실행하며, `scripts/lint-yaml`에서 사용합니다.
