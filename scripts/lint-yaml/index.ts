/**
 * `_nav.yaml`, `_redir.yaml`에 적힌 문서 링크가 유효한지 검사합니다.
 *
 * 사용법: `node scripts/lint-yaml/index.ts`
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  lintYaml,
  navLocalLinksValid,
  redirLocalLinksValid,
} from "@portone-io/lint-local-links-valid";
import fastGlob from "fast-glob";
import { VFile } from "vfile";
import { reporter } from "vfile-reporter";

const RULES = {
  "_nav.yaml": { rule: navLocalLinksValid, ruleId: "nav-local-links-valid" },
  "_redir.yaml": {
    rule: redirLocalLinksValid,
    ruleId: "redir-local-links-valid",
  },
} as const;

const filePaths = await fastGlob(
  Object.keys(RULES).map((name) => `src/routes/**/${name}`),
);

const files = await Promise.all(
  filePaths.sort().map(async (filePath) => {
    const file = new VFile({
      path: filePath,
      value: await readFile(filePath, "utf8"),
    });
    const { rule, ruleId } =
      RULES[path.basename(filePath) as keyof typeof RULES];
    try {
      for (const message of lintYaml(String(file.value), filePath, rule)) {
        file.message(message.message, {
          place: {
            start: { line: message.line, column: message.column },
            end: { line: message.endLine, column: message.endColumn },
          },
          ruleId,
          source: "lint-yaml",
        });
      }
    } catch (error) {
      const message = file.message("YAML을 처리할 수 없습니다", {
        cause: error,
        ruleId: "parse-error",
        source: "lint-yaml",
      });
      message.fatal = true;
    }
    return file;
  }),
);

const report = reporter(files, { quiet: true });
if (report) console.error(report);
if (files.some((file) => file.messages.length > 0)) process.exitCode = 1;
