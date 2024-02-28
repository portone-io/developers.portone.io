import eslint from "@eslint/js";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsEslintParser from "@typescript-eslint/parser";
import unocss from "@unocss/eslint-plugin";
import astroParser from "astro-eslint-parser";
import astro from "eslint-plugin-astro";
import * as mdx from "eslint-plugin-mdx";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import sortImports from "eslint-plugin-simple-import-sort";

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
  { ignores: ["dist", ".astro", ".vercel"] },
  {
    ...eslint.configs.recommended,
    ignores: ["scripts/**/*.ts", "**/*.mdx/*"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["scripts/**/*.ts", "**/*.astro/*.ts"],
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
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
    }),
  },
  {
    files: ["**/*.mdx/*"],
    rules: { "prettier/prettier": "error" },
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
    files: ["**/*.astro"],
    plugins: { astro, "@typescript-eslint": tsEslintPlugin },
    processor: "astro/client-side-ts",
    languageOptions: {
      globals: {
        node: true,
        "astro/astro": true,
        es2020: true,
      },
      parser: astroParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
        sourceType: "module",
      },
    },
    rules: {
      ...astro.configs.recommended.rules,
      ...tsRules,
    },
  },
  {
    files: ["**/*.astro/*.ts", "*.astro/*.ts"],
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
    },
    languageOptions: {
      globals: {
        browser: true,
        es2020: true,
      },
      parser: tsEslintParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {
      ...tsRules,
      "prettier/prettier": "off",
    },
  },
];
