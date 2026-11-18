import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface VirtualFile {
  /** 임시 디렉토리 기준 파일 이름 (예: `12.tsx`) */
  name: string;
  source: string;
}

export interface OxlintDiagnostic {
  name: string;
  message: string;
  /** 예: `no-undef`, `typescript/no-explicit-any` */
  ruleId: string;
  /** 1부터 시작하는 줄 번호 */
  line: number;
  /** 1부터 시작하는 UTF-16 기준 열 번호 */
  column: number;
}

interface OxlintJsonOutput {
  diagnostics: {
    message: string;
    code?: string;
    filename: string;
    labels?: { span: { line: number; column: number } }[];
  }[];
}

/**
 * 가상 파일들을 임시 디렉토리에 쓰고 주어진 설정으로 oxlint를 실행합니다.
 *
 * 설정의 `overrides` glob은 설정 파일 위치를 기준으로 해석되므로, 설정 파일도
 * 같은 임시 디렉토리에 생성합니다.
 */
export async function runOxlint(
  files: VirtualFile[],
  config: object,
): Promise<OxlintDiagnostic[]> {
  if (files.length === 0) return [];
  const dir = await mkdtemp(path.join(tmpdir(), "lint-mdx-"));
  try {
    const configPath = path.join(dir, ".oxlintrc.json");
    await writeFile(configPath, JSON.stringify(config));
    await Promise.all(
      files.map((file) => writeFile(path.join(dir, file.name), file.source)),
    );
    const oxlintBin = path.resolve("node_modules/.bin/oxlint");
    const stdout = await execOxlint(oxlintBin, [
      "-c",
      configPath,
      "--format",
      "json",
      dir,
    ]);
    const output = JSON.parse(stdout) as OxlintJsonOutput;
    const sources = new Map(files.map((file) => [file.name, file.source]));
    return Promise.all(
      output.diagnostics.map(async (diagnostic) => {
        const name = path.basename(diagnostic.filename);
        const source =
          sources.get(name) ??
          (await readFile(path.join(dir, name), "utf8").catch(() => ""));
        const span = diagnostic.labels?.[0]?.span;
        const line = span?.line ?? 1;
        return {
          name,
          message: diagnostic.message,
          ruleId: toRuleId(diagnostic.code),
          line,
          column: span ? toUtf16Column(source, line, span.column) : 1,
        };
      }),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function execOxlint(bin: string, args: string[]) {
  try {
    const { stdout } = await execFileAsync(bin, args, {
      maxBuffer: 64 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    // 진단이 있으면 oxlint는 0이 아닌 코드로 종료하지만 stdout에는 결과가 있습니다.
    const { stdout } = error as { stdout?: string };
    if (stdout) return stdout;
    throw error;
  }
}

/** `eslint(no-undef)` → `no-undef`, `typescript-eslint(no-explicit-any)` → `typescript/no-explicit-any` */
function toRuleId(code: string | undefined) {
  const match = code?.match(/^([\w-]+)\(([\w-]+)\)$/);
  if (!match) return code ?? "oxlint";
  const [, plugin, rule] = match;
  return plugin === "eslint"
    ? rule!
    : `${plugin!.replace(/-eslint$/, "")}/${rule!}`;
}

/** oxlint는 UTF-8 바이트 기준 열 번호를 반환하므로 UTF-16 기준으로 변환합니다. */
export function toUtf16Column(source: string, line: number, column: number) {
  const lineText = source.split("\n")[line - 1] ?? "";
  const bytes = Buffer.from(lineText, "utf8").subarray(0, column - 1);
  return bytes.toString("utf8").length + 1;
}
