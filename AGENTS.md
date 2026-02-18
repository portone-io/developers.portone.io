# Repository Guidelines

## Project Structure & Module Organization
- `src/routes/(root)` contains site routes (docs, API pages, SDK guides, blog, release notes).
- `src/components` and `src/layouts` hold reusable Solid/MDX UI building blocks.
- `scripts/` contains build-time generators such as `sitemap`, `llms-txt`, `docs-for-llms`, and `mdx-to-markdown`.
- `packages/*` contains workspace utilities (custom lint rules, remark plugins, schema/code generators).
- Generated files live in `src/content/__generated__` and `src/components/parameter/__generated__`; do not edit these manually.
- Keep content assets next to MDX in `_assets/` directories (for example, release note images under dated folders).

## Build, Test, and Development Commands
- `pnpm install`: install workspace dependencies (Node `24.x` required).
- `pnpm dev`: start local development server (`http://localhost:3000`) with schema/collection watchers.
- `pnpm build`: run full production pipeline (schema update, collection generation, LLM docs, sitemap, Vite build).
- `pnpm check`: run lint gate used by CI.
- `pnpm lint:fix`: auto-fix lint/style issues where possible.
- `pnpm test`: run Vitest suites in `src/` and `scripts/`.
- `pnpm test:watch`: run tests in watch mode during local iteration.

## Coding Style & Naming Conventions
- Follow `.editorconfig`: 2-space indentation, LF line endings, final newline.
- TypeScript strict mode is enabled; prefer `~/*` imports for `src` modules.
- ESLint + Prettier + remark-lint are authoritative; keep imports sorted and UnoCSS utilities in enforced order.
- In MDX, prefer semantic markdown and import local images from `_assets/` instead of hard-coded URL paths.
- Use date-based names for release notes: `YYYY-MM-DD.mdx`.

## Testing Guidelines
- Place tests as `*.test.ts` under `src/` or `scripts/` to match root Vitest include rules.
- For workspace package changes, run package-local tests (example: `pnpm --filter @portone-io/lint-local-links-valid test`).
- No global coverage threshold is configured; add focused tests for changed parser/transform behavior.

## Commit & Pull Request Guidelines
- Match existing history: short imperative subjects, optionally prefixed (`docs:`, `feat:`, `fix:`, `refactor:`, `chore:`), with issue refs when relevant (for example, `(#1005)`).
- Keep one logical change per commit.
- PRs should include purpose, impacted paths, and validation steps (`pnpm check` minimum; include `pnpm test` for code changes).
- CODEOWNERS routes review to `@portone-io/dx-chapter`; docs/release-note content may require additional owner review.
