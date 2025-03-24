import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import fastGlob from "fast-glob";
import type { Root } from "mdast";

import { astToMarkdownString, transformAstForMarkdown } from "./index";
import { type MdxParseResult, parseMdxFile } from "./mdx-parser";

// 프로젝트 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

// 문서 카테고리 경로 접두사 정의
export const PATH_PREFIXES = {
  RELEASE_NOTES: "release-notes/",
  BLOG: "blog/posts/",
  API: "api/",
  SDK: "sdk/",
  PLATFORM: "platform/",
};

/**
 * 모든 MDX 파일을 파싱하고 결과를 맵으로 반환하는 함수
 * @returns 파일 경로(slug)와 파싱 결과를 매핑한 객체
 */
export async function parseAllMdxFiles(): Promise<
  Record<string, MdxParseResult>
> {
  // MDX 파일 찾기
  const mdxFiles = await fastGlob(["src/routes/**/*.mdx"], {
    cwd: rootDir,
  });

  console.log(`총 ${mdxFiles.length}개의 MDX 파일을 찾았습니다.`);

  // 파일 경로와 파싱 결과를 매핑할 객체
  const fileParseMap: Record<string, MdxParseResult> = {};

  // 각 MDX 파일 처리
  for (const mdxFile of mdxFiles) {
    try {
      // MDX 파싱
      const parseResult = await parseMdxFile(mdxFile);

      // 객체에 파싱 결과 저장 (slug를 키로 사용)
      fileParseMap[parseResult.slug] = parseResult;
    } catch (error) {
      console.error(`${mdxFile} 파싱 중 오류 발생:`, error);
    }
  }

  return fileParseMap;
}

/**
 * 모든 MDX 파일의 AST를 마크다운용 AST로 변환하는 함수
 * @param fileParseMap 파일 경로와 파싱 결과를 매핑한 객체
 * @param useMarkdownLinks 내부 링크를 마크다운 파일 링크로 변환할지 여부 (true: 마크다운 파일 링크, false: 웹페이지 링크)
 * @returns 변환된 AST 노드 매핑 (slug -> Node)
 */
export function transformAllMdxsToAsts(
  fileParseMap: Record<string, MdxParseResult>,
  useMarkdownLinks: boolean = true,
): Record<string, Root> {
  // 변환된 AST 노드를 저장할 객체
  const transformedAstMap: Record<string, Root> = {};

  // 각 파싱 결과의 AST 변환
  const allUnhandledTags: Set<string> = new Set();
  for (const slug of Object.keys(fileParseMap)) {
    try {
      // AST 변환 (useMarkdownLinks 파라미터 전달)
      const { ast, unhandledTags } = transformAstForMarkdown(
        slug,
        fileParseMap,
        useMarkdownLinks,
      );
      transformedAstMap[slug] = ast;
      for (const tag of unhandledTags) {
        allUnhandledTags.add(tag);
      }
    } catch (error) {
      console.error(
        `${fileParseMap[slug]?.filePath} AST 변환 중 오류 발생:`,
        error,
      );
    }
  }

  console.log(
    `${Object.keys(transformedAstMap).length}개의 MDX 파일 AST 변환이 완료되었습니다.`,
  );

  if (allUnhandledTags.size > 0) {
    console.log(
      `처리되지 않은 태그: ${Array.from(allUnhandledTags).join(", ")}`,
    );
  }
  return transformedAstMap;
}

/**
 * 변환된 AST를 마크다운 파일로 저장하는 함수
 * @param fileParseMap 파일 경로와 파싱 결과를 매핑한 객체
 * @param transformedAstMap 변환된 AST 노드 매핑 (slug -> Node)
 * @param outputDir 출력 디렉토리 경로
 */
export async function saveMarkdownFiles(
  fileParseMap: Record<string, MdxParseResult>,
  transformedAstMap: Record<string, Root>,
  outputDir: string,
): Promise<void> {
  // 각 변환된 AST를 마크다운 파일로 저장
  for (const slug of Object.keys(transformedAstMap)) {
    try {
      const transformedAst = transformedAstMap[slug];
      if (transformedAst == null)
        throw new Error(`${slug}에 대한 AST를 찾을 수 없습니다.`);

      // 마크다운 문자열로 변환
      const markdown = astToMarkdownString(
        transformedAst,
        fileParseMap[slug]?.frontmatter,
      );

      // 출력 경로 생성
      const outputPath = join(outputDir, `${slug}.md`);

      // 디렉토리 생성
      await mkdir(dirname(outputPath), { recursive: true });

      // 파일 저장
      await writeFile(outputPath, markdown, "utf-8");
    } catch (error) {
      console.error(
        `${fileParseMap[slug]?.filePath} 마크다운 저장 중 오류 발생:`,
        error,
      );
    }
  }

  console.log("마크다운 파일 저장이 완료되었습니다.");
}

/**
 * 카테고리별 슬러그 필터링 함수
 * @param slugs 필터링할 슬러그 목록
 * @param categoryPrefix 카테고리 접두사
 * @returns 필터링된 슬러그 목록
 */
export function filterSlugsByCategory(
  slugs: string[],
  categoryPrefix: string,
): string[] {
  return slugs.filter((slug) => slug.startsWith(categoryPrefix));
}

/**
 * 버전별 슬러그 분류 함수
 * @param slugs 분류할 슬러그 목록
 * @param fileParseMap 파일 파싱 결과 맵
 * @returns 버전별로 분류된 슬러그 목록 객체
 */
export function categorizeSlugsByVersion(
  slugs: string[],
  fileParseMap: Record<string, MdxParseResult>,
): { v1Slugs: string[]; v2Slugs: string[]; commonSlugs: string[] } {
  const v1Slugs: string[] = [];
  const v2Slugs: string[] = [];
  const commonSlugs: string[] = [];

  // 각 슬러그를 버전별로 분류
  for (const slug of slugs) {
    const parseResult = fileParseMap[slug];
    const targetVersions = parseResult?.frontmatter.targetVersions || [];

    // targetVersions가 ["v1", "v2"] 이거나 빈 배열이면 공용 문서로 취급
    if (
      targetVersions.length === 0 ||
      (targetVersions.includes("v1") && targetVersions.includes("v2"))
    ) {
      commonSlugs.push(slug);
    }
    // v1 문서
    else if (targetVersions.includes("v1")) {
      v1Slugs.push(slug);
    }
    // v2 문서
    else if (targetVersions.includes("v2")) {
      v2Slugs.push(slug);
    }
    // 버전 정보가 없으면 공용 문서로 취급
    else {
      commonSlugs.push(slug);
    }
  }

  return { v1Slugs, v2Slugs, commonSlugs };
}

/**
 * 슬러그 그룹을 버전별로 분류하는 함수
 * @param slugs 모든 슬러그 목록
 * @param fileParseMap 파일 파싱 결과 맵
 * @returns 카테고리 및 버전별로 분류된 슬러그 목록 객체
 */
export function categorizeSlugs(
  slugs: string[],
  fileParseMap: Record<string, MdxParseResult>,
): {
  releaseNoteSlugs: string[];
  blogSlugs: string[];
  platformSlugs: string[];
  v1Slugs: string[];
  v2Slugs: string[];
  commonSlugs: string[];
} {
  // 릴리즈 노트, 블로그, 파트너정산 슬러그 먼저 필터링
  const releaseNoteSlugs = filterSlugsByCategory(
    slugs,
    PATH_PREFIXES.RELEASE_NOTES,
  );
  const blogSlugs = filterSlugsByCategory(slugs, PATH_PREFIXES.BLOG);
  const platformSlugs = filterSlugsByCategory(slugs, PATH_PREFIXES.PLATFORM);

  // 릴리즈 노트, 블로그, 파트너정산을 제외한 나머지 슬러그들만 버전별로 분류
  const remainingSlugs = slugs.filter(
    (slug) =>
      !slug.startsWith(PATH_PREFIXES.RELEASE_NOTES) &&
      !slug.startsWith(PATH_PREFIXES.BLOG) &&
      !slug.startsWith(PATH_PREFIXES.PLATFORM),
  );

  // 버전별 분류
  const { v1Slugs, v2Slugs, commonSlugs } = categorizeSlugsByVersion(
    remainingSlugs,
    fileParseMap,
  );

  return {
    releaseNoteSlugs,
    blogSlugs,
    platformSlugs,
    v1Slugs,
    v2Slugs,
    commonSlugs,
  };
}
