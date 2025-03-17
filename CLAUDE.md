# PortOne Developers Documentation - Guidelines

## Build & Test Commands
- Build: `pnpm build`
- Development: `pnpm dev`
- Lint: `pnpm lint`
- Lint with fix: `pnpm lint:fix`
- Type check: `pnpm check`
- Test: `pnpm test`
- Test with watch mode: `pnpm test:watch`
- Test single file: `pnpm test path/to/file.spec.ts`
- Generate llms.txt files: `pnpm llms-txt`

## Code Style Guidelines
- **TypeScript**: Strict mode, no unused variables/parameters, no implicit returns
- **Imports**: Use `eslint-plugin-simple-import-sort` ordering
- **CSS**: Use UnoCSS (order with `unocss/order` rule)
- **JSX**: Use Solid.js syntax with `solid-js` as jsxImportSource
- **Formatting**: Follow Prettier rules
- **Naming**: Use consistent casing in file names
- **Error Handling**: Prefer typed errors with meaningful messages

## Documentation Guidelines
- Use MDX format with proper semantic markdown
- Use component imports for images rather than direct paths
- Available components: `<Figure>`, `<Hint>`, `<Tabs>`, `<Details>`, `<VersionGate>`
- Code blocks should use proper language identifiers
- Use remark plugins for consistent markdown styling

## Repository Structure
- Monorepo using pnpm workspaces
- Node requirement: >=22.6.0
- Path aliases: `~/*` → `./src/*`
- Important scripts: `llms-txt`, `update-schema`, `gen-collections`
- Pre-commit workflow: Run linting and type checking before commits
