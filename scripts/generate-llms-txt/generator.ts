import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import fastGlob from "fast-glob";
import type { Root } from "mdast";

import { type MdxParseResult, parseMdxFile } from "./mdx-parser";
import {
  astToMarkdownString,
  transformAstForMarkdown,
} from "./mdx-to-markdown";

// 프로젝트 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const outputDir = join(rootDir, "public", "markdown");

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
 * @returns 변환된 AST 노드 매핑 (slug -> Node)
 */
export function transformAllMdxToAst(
  fileParseMap: Record<string, MdxParseResult>,
): Record<string, Root> {
  // 변환된 AST 노드를 저장할 객체
  const transformedAstMap: Record<string, Root> = {};

  // 각 파싱 결과의 AST 변환
  for (const slug of Object.keys(fileParseMap)) {
    try {
      // AST 변환
      const transformedAst = transformAstForMarkdown(slug, fileParseMap);
      if (transformedAst) {
        transformedAstMap[slug] = transformedAst;
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
  return transformedAstMap;
}

/**
 * 변환된 AST를 마크다운 파일로 저장하는 함수
 * @param fileParseMap 파일 경로와 파싱 결과를 매핑한 객체
 * @param transformedAstMap 변환된 AST 노드 매핑 (slug -> Node)
 */
export async function saveMarkdownFiles(
  fileParseMap: Record<string, MdxParseResult>,
  transformedAstMap: Record<string, Root>,
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
      const outputRelativePath = `${slug}.md`;
      const outputPath = join(outputDir, outputRelativePath);

      // 디렉토리 생성
      await mkdir(dirname(outputPath), { recursive: true });

      // 파일 저장
      await writeFile(outputPath, markdown, "utf-8");

      console.log(
        `마크다운 저장 완료: ${fileParseMap[slug]?.filePath} -> ${outputPath}`,
      );
    } catch (error) {
      console.error(
        `${fileParseMap[slug]?.filePath} 마크다운 저장 중 오류 발생:`,
        error,
      );
    }
  }

  console.log("모든 마크다운 파일 저장이 완료되었습니다.");
}

/**
 * 모든 마크다운 파일을 읽고 llms.txt 파일을 생성하는 함수
 * 변환된 AST 노드를 재사용하여 llms.txt, llms-full.txt, llms-small.txt 파일을 생성
 * @param fileParseMap MDX 파싱 결과 맵
 * @param transformedAstMap 변환된 AST 노드 맵
 * @returns 생성된 llms.txt 파일 경로
 */
export async function generateLlmsTxtFiles(
  fileParseMap: Record<string, MdxParseResult>,
  transformedAstMap: Record<string, Root>,
): Promise<string> {
  // fileParseMap에서 slug 추출
  const slugs = Object.keys(fileParseMap);

  console.log(`총 ${slugs.length}개의 문서를 찾았습니다.`);

  // 문서 카테고리 경로 접두사 정의
  const PATH_PREFIXES = {
    RELEASE_NOTES: "release-notes/",
    BLOG: "blog/posts/",
    API: "api/",
    SDK: "sdk/",
    PLATFORM: "platform/",
  };

  // 카테고리별 필터링 함수
  const filterByCategory = (files: string[], categoryPrefix: string) => {
    return files.filter((slug) => slug.startsWith(categoryPrefix));
  };

  // 릴리즈 노트, 블로그, 파트너정산 파일 먼저 필터링
  const releaseNoteFiles = filterByCategory(slugs, PATH_PREFIXES.RELEASE_NOTES);
  const blogFiles = filterByCategory(slugs, PATH_PREFIXES.BLOG);
  const platformFiles = filterByCategory(slugs, PATH_PREFIXES.PLATFORM);

  // 릴리즈 노트, 블로그, 파트너정산을 제외한 나머지 파일들만 버전별로 분류
  const remainingFiles = slugs.filter(
    (slug) =>
      !slug.startsWith(PATH_PREFIXES.RELEASE_NOTES) &&
      !slug.startsWith(PATH_PREFIXES.BLOG) &&
      !slug.startsWith(PATH_PREFIXES.PLATFORM),
  );

  // 버전별 및 카테고리별 파일 필터링
  const v1Files: string[] = [];
  const v2Files: string[] = [];
  const commonFiles: string[] = [];

  // 각 파일을 버전별로 분류
  for (const slug of remainingFiles) {
    const parseResult = fileParseMap[slug];
    const targetVersions = parseResult?.frontmatter.targetVersions || [];

    // targetVersions가 ["v1", "v2"] 이거나 빈 배열이면 공용 문서로 취급
    if (
      targetVersions.length === 0 ||
      (targetVersions.includes("v1") && targetVersions.includes("v2"))
    ) {
      commonFiles.push(slug);
    }
    // targetVersions가 ["v1"]만 있으면 v1 문서로 취급
    else if (targetVersions.includes("v1")) {
      v1Files.push(slug);
    }
    // targetVersions가 ["v2"]만 있으면 v2 문서로 취급
    else if (targetVersions.includes("v2")) {
      v2Files.push(slug);
    }
    // 그 외의 경우 (예: 다른 버전이 명시된 경우) 공용 문서로 취급
    else {
      commonFiles.push(slug);
    }
  }

  // 링크 생성 헬퍼 함수
  const createLinkWithDescription = (slug: string): string => {
    const parseResult = fileParseMap[slug];
    const title = parseResult?.frontmatter.title || slug;
    const displayPath = `${slug}.md`;

    // description이 있는 경우 표준 형식에 맞게 추가
    if (parseResult?.frontmatter.description) {
      return `- [${title}](${displayPath}): ${parseResult.frontmatter.description}\n`;
    } else {
      return `- [${title}](${displayPath})\n`;
    }
  };

  // 릴리스 노트 링크 생성 함수
  const createReleaseNoteLink = (slug: string): string => {
    const displayPath = `${slug}.md`;
    // slug에서 카테고리와 날짜 추출
    const parts = slug.split("/");
    if (parts.length >= 3) {
      const category = parts[1]; // api-sdk, console, platform
      const date = parts[2]; // 날짜 (YYYY-MM-DD)

      let categoryName = "";
      if (category === "api-sdk") {
        categoryName = "API / SDK";
      } else if (category === "console") {
        categoryName = "관리자콘솔";
      } else if (category === "platform") {
        categoryName = "파트너 정산 자동화";
      }

      return `- [${categoryName} ${date}](${displayPath})\n`;
    }

    // 형식이 맞지 않는 경우 기본 형식으로 반환
    return `- [${slug}](${displayPath})\n`;
  };

  // llms.txt 파일 내용 생성
  let llmsTxtContent = `# PortOne 개발자 문서

> PortOne은 온라인 결제, 본인인증, 파트너 정산 자동화 및 재무/회계 업무를 위한 API와 SDK를 제공합니다.

`;

  // 공용 문서 섹션 추가
  llmsTxtContent += `## 공통 문서 (V1 & V2)\n\n`;

  // 공용 SDK 문서
  const commonSdkFiles = filterByCategory(commonFiles, PATH_PREFIXES.SDK);
  if (commonSdkFiles.length > 0) {
    for (const slug of commonSdkFiles) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // 공용 API 레퍼런스 문서
  const commonApiFiles = filterByCategory(commonFiles, PATH_PREFIXES.API);
  if (commonApiFiles.length > 0) {
    for (const slug of commonApiFiles) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // 기타 공용 문서
  const commonOtherFiles = commonFiles.filter(
    (slug) =>
      !slug.startsWith(PATH_PREFIXES.SDK) &&
      !slug.startsWith(PATH_PREFIXES.API),
  );
  if (commonOtherFiles.length > 0) {
    for (const slug of commonOtherFiles) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // V2 문서 섹션 추가
  if (v2Files.length > 0) {
    llmsTxtContent += `\n## V2 문서\n\n`;

    // V2 SDK 문서
    const v2SdkFiles = filterByCategory(v2Files, PATH_PREFIXES.SDK);
    if (v2SdkFiles.length > 0) {
      llmsTxtContent += `### V2 SDK\n\n`;
      for (const slug of v2SdkFiles) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V2 API 문서
    const v2ApiFiles = filterByCategory(v2Files, PATH_PREFIXES.API);
    if (v2ApiFiles.length > 0) {
      llmsTxtContent += `\n### V2 API 레퍼런스\n\n`;
      for (const slug of v2ApiFiles) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V2 통합 가이드 및 기타 문서
    const v2OtherFiles = v2Files.filter(
      (slug) =>
        !slug.startsWith(PATH_PREFIXES.SDK) &&
        !slug.startsWith(PATH_PREFIXES.API),
    );
    if (v2OtherFiles.length > 0) {
      llmsTxtContent += `\n### V2 통합 가이드\n\n`;
      for (const slug of v2OtherFiles) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }
  }

  // V1 문서 섹션 추가
  if (v1Files.length > 0) {
    llmsTxtContent += `\n## V1 문서\n\n`;

    // V1 SDK 문서
    const v1SdkFiles = filterByCategory(v1Files, PATH_PREFIXES.SDK);
    if (v1SdkFiles.length > 0) {
      llmsTxtContent += `### V1 SDK\n\n`;
      for (const slug of v1SdkFiles) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V1 API 레퍼런스 문서
    const v1ApiFiles = filterByCategory(v1Files, PATH_PREFIXES.API);
    if (v1ApiFiles.length > 0) {
      llmsTxtContent += `\n### V1 API 레퍼런스\n\n`;
      for (const slug of v1ApiFiles) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V1 통합 가이드 및 기타 문서
    const v1OtherFiles = v1Files.filter(
      (slug) =>
        !slug.startsWith(PATH_PREFIXES.SDK) &&
        !slug.startsWith(PATH_PREFIXES.API),
    );
    if (v1OtherFiles.length > 0) {
      llmsTxtContent += `\n### V1 통합 가이드\n\n`;
      for (const slug of v1OtherFiles) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }
  }

  // 파트너정산 섹션 추가 (platform/ 하위 문서)
  if (platformFiles.length > 0) {
    llmsTxtContent += `\n## 파트너정산\n\n`;
    for (const slug of platformFiles) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // 릴리스 노트 섹션 추가
  if (releaseNoteFiles.length > 0) {
    llmsTxtContent += `\n## 릴리스 노트\n\n`;
    for (const slug of releaseNoteFiles) {
      llmsTxtContent += createReleaseNoteLink(slug);
    }
  }

  // 블로그 섹션 추가
  if (blogFiles.length > 0) {
    llmsTxtContent += `\n## 블로그\n\n`;
    for (const slug of blogFiles) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // llms.txt 파일 저장
  const llmsTxtPath = join(rootDir, "public", "llms.txt");
  await writeFile(llmsTxtPath, llmsTxtContent, "utf-8");
  console.log(`llms.txt 파일이 생성되었습니다: ${llmsTxtPath}`);

  // llms-full.txt 파일 생성 (모든 문서 내용 포함)
  let fullContent = llmsTxtContent;
  for (const slug of slugs) {
    const transformedAst = transformedAstMap[slug];
    if (transformedAst == null)
      throw new Error(`${slug}에 대한 AST를 찾을 수 없습니다.`);

    // 이미 변환된 AST를 사용하여 마크다운 생성
    const markdown = astToMarkdownString(
      transformedAst,
      fileParseMap[slug]?.frontmatter,
    );
    fullContent += `\n\n# ${slug}\n\n${markdown}`;
  }
  const llmsFullTxtPath = join(rootDir, "public", "llms-full.txt");
  await writeFile(llmsFullTxtPath, fullContent, "utf-8");
  console.log(`llms-full.txt 파일이 생성되었습니다: ${llmsFullTxtPath}`);

  // llms-small.txt 파일 생성 (처음 10개 문서만 포함)
  let smallContent = llmsTxtContent;
  for (const slug of slugs.slice(0, 10)) {
    const transformedAst = transformedAstMap[slug];
    if (transformedAst == null)
      throw new Error(`${slug}에 대한 AST를 찾을 수 없습니다.`);

    // 이미 변환된 AST를 사용하여 마크다운 생성
    const markdown = astToMarkdownString(
      transformedAst,
      fileParseMap[slug]?.frontmatter,
    );
    smallContent += `\n\n# ${slug}\n\n${markdown}`;
  }
  const llmsSmallTxtPath = join(rootDir, "public", "llms-small.txt");
  await writeFile(llmsSmallTxtPath, smallContent, "utf-8");
  console.log(`llms-small.txt 파일이 생성되었습니다: ${llmsSmallTxtPath}`);

  return llmsTxtPath;
}
