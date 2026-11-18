import { readFile } from "node:fs/promises";

/** 가상 파일 이름 규칙: MDX 스코프 검사용은 `.mdx.jsx`, 코드 블록은 `.ts`/`.tsx` */
export const SCOPE_FILE_SUFFIX = ".mdx.jsx";

const TS_OVERRIDE_FILES = "**/*.{ts,tsx}";

interface OxlintConfig {
  rules?: Record<string, unknown>;
  overrides?: {
    files: string[];
    plugins?: string[];
    rules?: Record<string, unknown>;
  }[];
}

/**
 * 가상 파일 검사에 사용할 oxlint 설정을 루트 `.oxlintrc.json`에서 만듭니다.
 *
 * - MDX 본문: 루트의 기본 규칙으로 import하지 않은 컴포넌트(`no-undef`)와
 *   사용하지 않는 import(`no-unused-vars`)를 찾습니다.
 * - TypeScript 코드 블록: 루트의 TS 규칙을 그대로 쓰되, 예제 코드이므로
 *   `no-unused-vars`는 끕니다. `typeAware`를 켜지 않으므로 타입 정보가 필요한
 *   규칙은 실행되지 않습니다.
 */
export async function createOxlintConfig(rootConfigPath: string) {
  const rootConfig = JSON.parse(
    await readFile(rootConfigPath, "utf8"),
  ) as OxlintConfig;
  const tsOverride = rootConfig.overrides?.find(
    (override) =>
      override.files.length === 1 && override.files[0] === TS_OVERRIDE_FILES,
  );
  if (!tsOverride) {
    throw new Error(
      `${rootConfigPath}에서 "${TS_OVERRIDE_FILES}" override를 찾을 수 없습니다`,
    );
  }

  return {
    categories: { correctness: "off" },
    env: { builtin: true },
    overrides: [
      {
        files: [`**/*${SCOPE_FILE_SUFFIX}`],
        globals: { React: "readonly", props: "readonly" },
        rules: rootConfig.rules ?? {},
      },
      {
        files: [TS_OVERRIDE_FILES],
        plugins: tsOverride.plugins ?? ["typescript"],
        rules: { ...tsOverride.rules, "no-unused-vars": "off" },
      },
    ],
  };
}
