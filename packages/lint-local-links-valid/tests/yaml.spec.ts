import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  lintYaml,
  navLocalLinksValid,
  redirLocalLinksValid,
} from "../src/index.ts";

const fixturesDir = path.resolve(import.meta.dirname, "__fixtures__");

describe("_redir.yaml", () => {
  const filePath = path.join(fixturesDir, "docs/_redir.yaml");
  const lint = (code: string) => lintYaml(code, filePath, redirLocalLinksValid);

  it("accepts redirects to existing documents and API references", () => {
    expect(
      lint(
        [
          "- old: /a/b",
          "  new: a/b/c",
          "- old: /a/c",
          "  new: a/b/c#section?v=v1",
          "- old: /api/old",
          "  new: api/rest-v1/certification#post%20%2Fcertifications",
        ].join("\n"),
      ),
    ).toEqual([]);
  });

  it("follows redirect chains", () => {
    expect(
      lint(
        ["- old: /x", "  new: docs/y", "- old: /y", "  new: a/b/c"].join("\n"),
      ),
    ).toEqual([]);
  });

  it("reports missing documents at the end of a chain", () => {
    expect(
      lint(
        ["- old: /x", "  new: docs/y", "- old: /z", "  new: a/b/d"].join("\n"),
      ),
    ).toEqual([
      expect.objectContaining({
        message: "파일을 찾을 수 없습니다: /docs/y",
        line: 2,
        column: 8,
      }),
      expect.objectContaining({
        message: "파일을 찾을 수 없습니다: /a/b/d",
        line: 4,
        column: 8,
      }),
    ]);
  });

  it("reports malformed links", () => {
    expect(
      lint(
        [
          "- old: a/b",
          "  new: a/b/c",
          "- old: /a/c",
          "  new: /a/b/c",
          "- old: /a/d",
          "  new: https://example.com",
        ].join("\n"),
      ).map((message) => [message.line, message.message]),
    ).toEqual([
      [1, "'old' 링크는 '/' 로 시작해야 합니다."],
      [4, "'new' 링크는 '/' 없이 사이트 루트 기준으로 적어야 합니다."],
      [6, "'new' 링크는 외부 URL일 수 없습니다."],
    ]);
  });

  it("reports invalid keys and missing links", () => {
    const messages = lint(["- title: Test", "  url: test"].join("\n"));
    expect(messages.map((message) => message.message).sort()).toEqual(
      [
        "'new' 링크를 찾을 수 없습니다.",
        "'old' 링크를 찾을 수 없습니다.",
        "Pair 키는 'old' 또는 'new' 이어야 합니다.",
        "Pair 키는 'old' 또는 'new' 이어야 합니다.",
      ].sort(),
    );
  });

  it("reports duplicate redirects", () => {
    expect(
      lint(
        ["- old: /a", "  new: a/b/c", "- old: /a#section", "  new: a/b/c"].join(
          "\n",
        ),
      ).map((message) => [message.line, message.message]),
    ).toEqual([[3, "리다이렉트가 중복되었습니다."]]);
  });

  it("reports redirect cycles", () => {
    expect(
      lint(
        ["- old: /a", "  new: docs/b", "- old: /b", "  new: docs/a"].join("\n"),
      ).map((message) => [message.line, message.message]),
    ).toEqual([
      [2, "리다이렉트 사이클이 발생했습니다."],
      [4, "리다이렉트 사이클이 발생했습니다."],
    ]);
  });

  it("ignores files not named _redir.yaml", () => {
    expect(
      lintYaml(
        "- old: a\n  new: /b\n",
        path.join(fixturesDir, "docs/other.yaml"),
        redirLocalLinksValid,
      ),
    ).toEqual([]);
  });
});

describe("_nav.yaml", () => {
  const filePath = path.join(fixturesDir, "a/_nav.yaml");
  const lint = (code: string) => lintYaml(code, filePath, navLocalLinksValid);

  it("accepts links to existing documents and external URLs", () => {
    expect(
      lint(
        [
          "- label: 결제 연동",
          "  systemVersion: v1",
          "  items:",
          "    - slug: /a/b/c",
          "    - slug: /a/b/c#section",
          "      items:",
          "        - /a/b/c?v=v1",
          "        - https://example.com/a/b/d",
        ].join("\n"),
      ),
    ).toEqual([]);
  });

  it("reports links to missing documents", () => {
    expect(
      lint(["- title: Test", "  items:", "    - slug: /a/b/d"].join("\n")),
    ).toEqual([
      {
        message: "파일을 찾을 수 없습니다: /a/b/d",
        line: 3,
        column: 13,
        endLine: 3,
        endColumn: 19,
      },
    ]);
  });
});
