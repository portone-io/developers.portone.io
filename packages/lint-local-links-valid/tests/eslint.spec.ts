import path from "node:path";

import { type Rule, RuleTester } from "eslint";
import * as vitest from "vitest";
import YAMLParser from "yaml-eslint-parser";

import { rule } from "../src/eslint.ts";

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

ruleTester.run("lint-local-links-valid", rule as unknown as Rule.RuleModule, {
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
        - title: Test
          url: test
      `,
      filename: redirYamlPath,
      errors: [
        {
          messageId: "invalidKey",
          line: 2,
          endLine: 2,
          column: 11,
          endColumn: 16,
        },
        {
          messageId: "missingOldLink",
          line: 2,
          endLine: 3,
          column: 11,
          endColumn: 20,
        },
        {
          messageId: "missingNewLink",
          line: 2,
          endLine: 3,
          column: 11,
          endColumn: 20,
        },
        {
          messageId: "invalidKey",
          line: 3,
          endLine: 3,
          column: 11,
          endColumn: 14,
        },
      ],
    },
  ],
});
