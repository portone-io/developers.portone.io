// @ts-check

import { readFileSync } from "node:fs";

import { remarkLintLocalLinksValid } from "@portone-io/lint-local-links-valid";
import { load } from "js-yaml";
import stringWidth from "string-width";

const redirects = load(readFileSync("./src/content/docs/_redir.yaml", "utf8"));
if (!Array.isArray(redirects)) {
  throw new Error("Expected an array of redirects");
}

export default {
  plugins: [
    "remark-frontmatter",
    ["remark-gfm", { tableCellPadding: false, stringLength: stringWidth }],
    ["remark-lint-blockquote-indentation", 2],
    ["remark-lint-code-block-style", "fenced"],
    [
      "remark-lint-checkbox-character-style",
      {
        checked: "x",
        unchecked: " ",
      },
    ],
    "remark-lint-checkbox-content-indent",
    "remark-lint-definition-spacing",
    ["remark-lint-emphasis-marker", "_"],
    "remark-lint-fenced-code-flag",
    ["remark-lint-fenced-code-marker", "`"],
    "remark-lint-final-newline",
    ["remark-lint-first-heading-level", 2],
    "remark-lint-hard-break-spaces",
    "remark-lint-heading-increment",
    ["remark-lint-heading-style", "atx"],
    ["remark-lint-linebreak-style", "unix"],
    ["remark-lint-link-title-style", '"'],
    "remark-lint-list-item-bullet-indent",
    "remark-lint-list-item-content-indent",
    ["remark-lint-list-item-indent", "one"],
    "remark-lint-list-item-spacing",
    ["remark-lint-maximum-line-length", 100],
    "remark-lint-no-blockquote-without-marker",
    "remark-lint-no-consecutive-blank-lines",
    "remark-lint-no-duplicate-defined-urls",
    "remark-lint-no-duplicate-definitions",
    "remark-lint-no-empty-url",
    "remark-lint-no-file-name-consecutive-dashes",
    ["remark-lint-no-file-name-irregular-characters", "\\.a-z0-9-"],
    "remark-lint-no-file-name-outer-dashes",
    "remark-lint-no-heading-content-indent",
    "remark-lint-no-heading-indent",
    "remark-lint-no-heading-like-paragraph",
    "remark-lint-no-inline-padding",
    ["remark-lint-no-missing-blank-lines", { exceptTightLists: true }],
    "remark-lint-no-paragraph-content-indent",
    "remark-lint-no-shortcut-reference-image",
    "remark-lint-no-table-indentation",
    "remark-lint-no-tabs",
    "remark-lint-no-undefined-references",
    "remark-lint-no-unused-definitions",
    ["remark-lint-ordered-list-marker-style", "."],
    "remark-lint-ordered-list-marker-value",
    ["remark-lint-rule-style", "---"],
    ["remark-lint-strikethrough-marker", "~~"],
    ["remark-lint-strong-marker", "*"],
    ["remark-lint-table-cell-padding", "compact"],
    "remark-lint-table-pipe-alignment",
    "remark-lint-table-pipes",
    ["remark-lint-unordered-list-marker-style", "-"],
    [
      remarkLintLocalLinksValid,
      {
        baseDir: "./src/content",
        excludePaths: ["/api"],
        redirects: Object.fromEntries(
          redirects.map((redir) => {
            const { old: from, new: to } = redir;
            return [prefix(from), prefix(to)];
            function prefix(str) {
              if (str.startsWith("/")) {
                return "docs" + str;
              }
              return str;
            }
          }),
        ),
      },
    ],
  ],
  settings: {
    bullet: "-",
    rule: "-",
    emphasis: "_",
  },
};
