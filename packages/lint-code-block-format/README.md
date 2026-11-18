## @portone-io/lint-code-block-format

MDX 문서 안의 코드 블록이 oxfmt로 포맷되어 있는지 검사하는 remark-lint 규칙입니다.

포맷이 다르면 `expected`에 포맷된 코드를 담아 경고를 남기며, `scripts/lint-mdx`의 `--fix` 모드가 이 값을 사용해 코드 블록만 고칩니다.
