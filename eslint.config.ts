import { readFileSync } from "node:fs";

import eslint from "@eslint/js";
import codeBlockFormat from "@portone-io/lint-code-block-format";
import { eslintPlugin as localLinksValid } from "@portone-io/lint-local-links-valid";
import * as plainParser from "eslint-parser-plain";
import * as mdx from "eslint-plugin-mdx";
import sortImports from "eslint-plugin-simple-import-sort";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const formatOptions = JSON.parse(
  readFileSync("./.oxfmtrc.json", "utf8"),
) as Record<string, unknown>;
delete formatOptions.$schema;
delete formatOptions.ignorePatterns;
delete formatOptions.sortTailwindcss;

export default defineConfig([
  {
    ignores: [
      "**/__generated__/**",
      "dist",
      ".vercel",
      ".vinxi",
      ".output",
      ".nitro",
      ".solid-start",
      "packages/**/dist",
    ],
  },
  {
    files: ["**/*.mdx"],
    extends: [eslint.configs.recommended, mdx.flat],
    processor: mdx.createRemarkProcessor({ lintCodeBlocks: true }),
    languageOptions: { globals: { props: "readonly" } },
    plugins: { "simple-import-sort": sortImports },
    rules: {
      "mdx/remark": ["error", { deprecationWarnings: false }],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  mdx.flatCodeBlocks,
  {
    files: ["**/*.mdx/*.{ts,tsx,js,json,html,css,graphql}"],
    plugins: { "code-block": codeBlockFormat },
    rules: { "code-block/format": ["error", { formatOptions }] },
  },
  {
    files: ["**/*.mdx/*.{json,html,css,graphql}"],
    languageOptions: { parser: plainParser },
  },
  {
    files: ["**/*.mdx/*.js"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  {
    files: ["**/*.mdx/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
  {
    files: ["**/_nav.yaml"],
    languageOptions: { parser: plainParser },
    plugins: { "local-links-valid": localLinksValid },
    rules: { "local-links-valid/nav": "error" },
  },
  {
    files: ["**/_redir.yaml"],
    languageOptions: { parser: plainParser },
    plugins: { "local-links-valid": localLinksValid },
    rules: { "local-links-valid/redir": "error" },
  },
]);
