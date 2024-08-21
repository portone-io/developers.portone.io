import eslint from "@eslint/js";
import {
  navLintLocalLinksValid,
  redirLintLocalLinksValid,
} from "@portone-io/lint-local-links-valid";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsEslintParser from "@typescript-eslint/parser";
import unocss from "@unocss/eslint-plugin";
import * as parserPlain from "eslint-parser-plain";
import * as mdx from "eslint-plugin-mdx";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import sortImports from "eslint-plugin-simple-import-sort";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import YAMLParser from "yaml-eslint-parser";

const redirects = load(
  readFileSync("src/routes/(root)/docs/_redir.yaml", "utf8"),
);
if (!Array.isArray(redirects)) {
  throw new Error("Expected an array of redirects");
}

/** @type {import("eslint").Linter.RulesRecord} */
const tsRules = {
  ...tsEslintPlugin.configs["eslint-recommended"].overrides[0].rules,
  ...tsEslintPlugin.configs["recommended"].rules,
  "@typescript-eslint/no-unused-vars": [
    "error",
    { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
  ],
};

/** @type {import("eslint").Linter.RulesRecord} */
const tsTypeCheckedRules = {
  ...tsEslintPlugin.configs["recommended-type-checked"].rules,
  ...tsRules,
};

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  { ignores: ["dist", ".vercel", "**/docs/**/*"] },
  {
    ...eslint.configs.recommended,
    ignores: ["scripts/**/*.ts", "**/*.mdx/*"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["scripts/**/*.ts", "**/*.mdx/*", "**/__fixtures__/**/*"],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
    },
    rules: tsTypeCheckedRules,
  },
  prettierRecommended,
  {
    files: ["**/*.mdx/*.{json,yaml,yml,html,css,graphql,md,vue}"],
    languageOptions: {
      parser: {
        meta: {
          name: "eslint-parser-plain",
        },
        ...parserPlain,
      },
      ...prettierRecommended.languageOptions,
    },
    ...prettierRecommended,
  },
  {
    ...mdx.flat,
    files: ["**/*.mdx"],
    plugins: {
      ...mdx.flat.plugins,
      react,
    },
    rules: {
      "mdx/remark": "error",
      "react/jsx-uses-vars": "error",
      "prettier/prettier": "off",
    },
    processor: await mdx.createRemarkProcessor({
      lintCodeBlocks: true,
    }),
  },
  {
    files: ["**/*.mdx/*"],
    rules: { "prettier/prettier": "error" },
  },
  {
    files: ["**/*.mdx/*.{ts,tsx}"],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
    },
    rules: {
      ...tsRules,
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    plugins: { unocss },
    rules: { "unocss/order": "error" },
  },
  {
    plugins: { "simple-import-sort": sortImports },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["**/_redir.yaml", "**/_nav.yaml"],
    ignores: [],
    plugins: {
      redir: redirLintLocalLinksValid,
      nav: navLintLocalLinksValid,
    },
    languageOptions: {
      parser: YAMLParser,
    },
    rules: {
      "redir/local-links-valid": "error",
      "nav/local-links-valid": [
        "error",
        {
          redirects: Object.fromEntries(
            redirects.map(({ old: from, new: to }) => [from, to]),
          ),
        },
      ],
    },
  },
];
