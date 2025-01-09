import path from "node:path";

import { type Rule, RuleTester } from "eslint";
import * as vitest from "vitest";
import YAMLParser from "yaml-eslint-parser";

import { rule as navRule } from "../src/eslint/nav.ts";
import { rule as redirRule } from "../src/eslint/redir.ts";

// @ts-expect-error https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester
RuleTester.describe = vitest.describe;
// @ts-expect-error https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester
RuleTester.it = vitest.it;
// @ts-expect-error https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester
RuleTester.afterAll = vitest.afterAll;
// @ts-expect-error https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester
RuleTester.itOnly = vitest.it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: YAMLParser,
  },
});

const redirYamlPath = path.resolve(__dirname, "__fixtures__/_redir.yaml");
ruleTester.run("_redir.yaml", redirRule as unknown as Rule.RuleModule, {
  valid: [
    {
      code: `
        - old: /ko/api/identity-verification-api/confirm-otp-api
          new: >-
            https://developers.portone.io/api/rest-v1/certification#post%20%2Fcertifications%2Fotp%2Fconfirm%2F%7Bimp_uid%7D
      `,
      filename: redirYamlPath,
    },
  ],
  invalid: [
    {
      code: `
        - old: /a/b
          new: /a/c
        - title: Test
          url: test
      `,
      filename: redirYamlPath,
      errors: [
        {
          message: `파일을 찾을 수 없습니다: ${path.resolve(__dirname, "__fixtures__/a/c")}`,
          line: 2,
          endLine: 3,
          column: 11,
          endColumn: 20,
        },
        {
          messageId: "invalidKey",
          line: 4,
          endLine: 4,
          column: 11,
          endColumn: 16,
        },
        {
          messageId: "missingOldLink",
          line: 4,
          endLine: 5,
          column: 11,
          endColumn: 20,
        },
        {
          messageId: "missingNewLink",
          line: 4,
          endLine: 5,
          column: 11,
          endColumn: 20,
        },
        {
          messageId: "invalidKey",
          line: 5,
          endLine: 5,
          column: 11,
          endColumn: 14,
        },
      ],
    },
  ],
});

const navYamlPath = path.resolve(__dirname, "__fixtures__/a/_nav.yaml");
ruleTester.run("_nav.yaml", navRule as unknown as Rule.RuleModule, {
  valid: [
    {
      code: `
        - label: 결제 연동
          systemVersion: v1
          items:
            - slug: /a/b/c
            - slug: /a/b/c/d
              items:
                - slug: /a/b/c/e
                  items:
                    - /a/b/c/f
                    - /a/b/g
                - /a/h
                - /a/i
      `,
      filename: navYamlPath,
      options: [
        {
          redirects: {
            "/a/b/c/d": "/a/b/c",
            "/a/b/c/e": "/a/b/c",
            "/a/b/c/f": "/a/b/c",
            "/a/b/g": "/a/b/c",
            "/a/h": "/a/b/c",
            "/a/i": "/a/b/c",
          },
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
        - title: Test
          url: test
          items:
            - slug: /a/b/d
      `,
      errors: [
        {
          message: `파일을 찾을 수 없습니다: ${path.resolve(__dirname, "__fixtures__/a/b/d")}`,
          line: 5,
          endLine: 5,
          column: 21,
          endColumn: 27,
        },
      ],
      filename: navYamlPath,
    },
  ],
});
