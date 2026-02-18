import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import fastGlob from "fast-glob";
import yaml from "js-yaml";

import { generateSlug } from "../../src/utils/slugs.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const routesDir = "src/routes/(root)";

/** 정적 TSX 페이지 라우트 (MDX 스캔으로 잡히지 않는 것들) */
const STATIC_ROUTES = ["/", "/blog", "/release-notes"];

/** 제외할 slug 패턴 */
const EXCLUDE_PATTERNS = [
  // _로 시작하는 경로 세그먼트 (private 디렉토리/파일)
  /(^|\/)_/,
];

/**
 * MDX 파일에서 frontmatter를 파싱하여 draft 여부를 확인
 */
async function isDraft(filePath: string): Promise<boolean> {
  try {
    const content = await readFile(join(rootDir, filePath), "utf-8");
    const match = /^---\n([\s\S]*?)\n---/.exec(content);
    if (!match?.[1]) return false;
    const frontmatter = yaml.load(match[1]) as Record<string, unknown>;
    return frontmatter.draft === true;
  } catch {
    return false;
  }
}

/**
 * 모든 MDX 기반 라우트를 수집
 */
export async function collectRoutes(): Promise<string[]> {
  // MDX 파일 스캔
  const mdxFiles = (
    await fastGlob(["src/routes/**/*.mdx"], { cwd: rootDir })
  ).sort();

  const urls = new Set<string>(STATIC_ROUTES);

  for (const filePath of mdxFiles) {
    const slug = generateSlug(filePath, routesDir);

    // 빈 slug는 루트 (정적 라우트에서 처리)
    if (!slug) continue;

    // 제외 패턴 검사
    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(slug))) continue;

    // 블로그 draft 포스트 제외
    if (slug.startsWith("blog/posts/") && (await isDraft(filePath))) continue;

    urls.add(`/${slug}`);
  }

  return [...urls].sort();
}
