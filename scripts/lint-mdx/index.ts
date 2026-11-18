/**
 * MDX 문서를 검사합니다.
 *
 * - `.remarkrc.js`의 remark-lint 규칙 (코드 블록 포맷 검사 포함)
 * - MDX 본문의 import/컴포넌트 참조 검사 (oxlint `no-undef`, `no-unused-vars`)
 * - TypeScript 코드 블록 검사 (oxlint)
 *
 * 사용법: `node scripts/lint-mdx/index.ts [--fix] [파일 또는 디렉토리...]`
 */
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import fastGlob from "fast-glob";
import type { Root } from "mdast";
import { VFile } from "vfile";
import { reporter } from "vfile-reporter";

import { createOxlintConfig, SCOPE_FILE_SUFFIX } from "./config.ts";
import {
  applyEdits,
  createCodeBlockEdit,
  createStringifyEdits,
  type Edit,
} from "./fix.ts";
import { runOxlint, type VirtualFile } from "./oxlint.ts";
import { createProcessor } from "./remark.ts";
import { buildScopeSource, collectLintableCodeBlocks } from "./virtual.ts";

const IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/__generated__/**",
  ".vercel/**",
  ".vinxi/**",
  ".output/**",
  ".nitro/**",
  ".solid-start/**",
  `${fastGlob.escapePath("src/routes/(root)/docs")}/**`,
];

const CODE_BLOCK_FORMAT_RULE = "code-block-format";

interface LintResult {
  file: VFile;
  tree: Root | null;
}

const { values, positionals } = parseArgs({
  options: { fix: { type: "boolean", default: false } },
  allowPositionals: true,
});

const processor = await createProcessor(path.resolve(".remarkrc.js"));
const oxlintConfig = await createOxlintConfig(path.resolve(".oxlintrc.json"));

const filePaths = await resolveFiles(positionals);
let results = await lintFiles(filePaths);

if (values.fix) {
  const fixedPaths = await fixFiles(results);
  if (fixedPaths.size > 0) {
    const relinted = await lintFiles([...fixedPaths]);
    results = results.map(
      (result) =>
        relinted.find((r) => r.file.path === result.file.path) ?? result,
    );
  }
}

const files = results.map((result) => result.file);
const report = reporter(files, { quiet: true });
if (report) console.error(report);
if (files.some((file) => file.messages.length > 0)) process.exitCode = 1;

async function resolveFiles(inputs: string[]) {
  if (inputs.length === 0) {
    return fastGlob("**/*.mdx", { ignore: IGNORE });
  }
  const paths = await Promise.all(
    inputs.map(async (input) => {
      const stats = await stat(input);
      if (!stats.isDirectory()) return [input];
      const pattern = `${fastGlob.escapePath(input)}/**/*.mdx`;
      return fastGlob(pattern, { ignore: IGNORE });
    }),
  );
  return paths.flat();
}

async function lintFiles(paths: string[]): Promise<LintResult[]> {
  const results = await Promise.all(paths.map(lintWithRemark));

  const virtualFiles: VirtualFile[] = [];
  const owners = new Map<
    string,
    {
      file: VFile;
      toPoint: (
        line: number,
        column: number,
      ) => { line: number; column: number };
    }
  >();
  results.forEach(({ file, tree }, index) => {
    if (!tree) return;
    const scopeName = `${index}${SCOPE_FILE_SUFFIX}`;
    virtualFiles.push({
      name: scopeName,
      source: buildScopeSource(tree, String(file.value)),
    });
    owners.set(scopeName, {
      file,
      toPoint: (line, column) => ({ line, column }),
    });

    collectLintableCodeBlocks(tree).forEach(({ node, ext }, blockIndex) => {
      const start = node.position?.start;
      if (!start) return;
      const name = `${index}-${blockIndex}.${ext}`;
      virtualFiles.push({ name, source: node.value });
      // 코드 내용은 펜스 다음 줄부터 시작하고, 펜스와 같은 만큼 들여쓰여 있습니다.
      owners.set(name, {
        file,
        toPoint: (line, column) => ({
          line: start.line + line,
          column: start.column - 1 + column,
        }),
      });
    });
  });

  for (const diagnostic of await runOxlint(virtualFiles, oxlintConfig)) {
    const owner = owners.get(diagnostic.name);
    if (!owner) continue;
    owner.file.message(diagnostic.message, {
      place: owner.toPoint(diagnostic.line, diagnostic.column),
      ruleId: diagnostic.ruleId,
      source: "oxlint",
    });
  }
  return results;
}

async function lintWithRemark(filePath: string): Promise<LintResult> {
  const file = new VFile({
    path: filePath,
    value: await readFile(filePath, "utf8"),
  });
  try {
    const tree = processor.parse(file);
    await processor.run(tree, file);
    return { file, tree };
  } catch (error) {
    const message = file.message("MDX를 처리할 수 없습니다", {
      cause: toError(error),
      ruleId: "parse-error",
      source: "lint-mdx",
    });
    message.fatal = true;
    return { file, tree: null };
  }
}

async function fixFiles(results: LintResult[]) {
  const fixedPaths = new Set<string>();
  for (const { file, tree } of results) {
    if (!tree || file.messages.length === 0) continue;
    const source = String(file.value);
    const remarkMessages = file.messages.filter(
      (message) => message.source === "remark-lint",
    );
    const edits: Edit[] = [];
    for (const message of remarkMessages) {
      const formatted = message.expected?.[0];
      if (
        message.ruleId === CODE_BLOCK_FORMAT_RULE &&
        formatted != null &&
        message.place &&
        "start" in message.place
      ) {
        const edit = createCodeBlockEdit(
          source,
          { position: message.place },
          formatted,
        );
        if (edit) edits.push(edit);
      }
    }
    const otherMessages = remarkMessages.filter(
      (message) => message.ruleId !== CODE_BLOCK_FORMAT_RULE,
    );
    if (otherMessages.length > 0) {
      const stringified = processor.stringify(tree, file);
      edits.push(...createStringifyEdits(source, stringified, otherMessages));
    }
    const fixed = applyEdits(source, edits);
    if (fixed !== source) {
      await writeFile(file.path, fixed);
      fixedPaths.add(file.path);
    }
  }
  return fixedPaths;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
