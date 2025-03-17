import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import fastGlob from "fast-glob";
import type { Root } from "mdast";

import {
  astToMarkdownString,
  transformAstForMarkdown,
} from "../mdx-to-markdown";
import {
  type MdxParseResult,
  parseMdxFile,
} from "../mdx-to-markdown/mdx-parser";

// 프로젝트 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const outputDir = join(rootDir, "public", "markdown");
const docsForLlmsDir = join(rootDir, "docs-for-llms");

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
export function transformAllMdxToAst(
  fileParseMap: Record<string, MdxParseResult>,
  useMarkdownLinks: boolean = true,
): Record<string, Root> {
  // 변환된 AST 노드를 저장할 객체
  const transformedAstMap: Record<string, Root> = {};

  // 각 파싱 결과의 AST 변환
  for (const slug of Object.keys(fileParseMap)) {
    try {
      // AST 변환 (useMarkdownLinks 파라미터 전달)
      const transformedAst = transformAstForMarkdown(
        slug,
        fileParseMap,
        useMarkdownLinks,
      );
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
        throw new Error(`${slug}에 대한 AST 변환 결과를 찾을 수 없습니다.`);

      const frontmatter = fileParseMap[slug]?.frontmatter;

      // 마크다운 문자열로 변환
      const markdown = astToMarkdownString(transformedAst, frontmatter);

      // 저장할 파일 경로 생성
      const outputPath = join(outputDir, `${slug}.md`);

      // 디렉토리 생성
      await mkdir(dirname(outputPath), { recursive: true });

      // 파일 저장
      await writeFile(outputPath, markdown, "utf-8");
    } catch (error) {
      console.error(`${slug} 마크다운 파일 저장 중 오류 발생:`, error);
    }
  }

  console.log(
    `${Object.keys(transformedAstMap).length}개의 마크다운 파일이 생성되었습니다.`,
  );
}

/**
 * docs-for-llms 디렉토리를 생성하고 마크다운 파일들을 저장하는 함수
 * @param fileParseMap 파일 경로와 파싱 결과를 매핑한 객체
 * @param transformedAstMap 변환된 AST 노드 매핑 (slug -> Node)
 * @returns docs-for-llms 디렉토리 경로
 */
export async function generateDocsForLlms(
  fileParseMap: Record<string, MdxParseResult>,
  transformedAstMap: Record<string, Root>,
): Promise<string> {
  // fileParseMap에서 slug 추출
  const slugs = Object.keys(fileParseMap);

  console.log(`총 ${slugs.length}개의 문서를 찾았습니다.`);

  // docs-for-llms 디렉토리 생성
  await mkdir(docsForLlmsDir, { recursive: true });

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

  // 버전별 파일 분류 함수
  const categorizeFilesByVersion = (files: string[]) => {
    const v1Files: string[] = [];
    const v2Files: string[] = [];
    const commonFiles: string[] = [];

    for (const slug of files) {
      const parseResult = fileParseMap[slug];
      const targetVersions = parseResult?.frontmatter.targetVersions || [];

      if (
        targetVersions.length === 0 ||
        (targetVersions.includes("v1") && targetVersions.includes("v2"))
      ) {
        commonFiles.push(slug);
      } else if (targetVersions.includes("v1")) {
        v1Files.push(slug);
      } else if (targetVersions.includes("v2")) {
        v2Files.push(slug);
      } else {
        commonFiles.push(slug);
      }
    }

    return { v1Files, v2Files, commonFiles };
  };

  // 버전별 및 카테고리별 파일 필터링
  const { v1Files, v2Files, commonFiles } =
    categorizeFilesByVersion(remainingFiles);

  // 링크 생성 헬퍼 함수
  const createLinkWithDescription = (slug: string): string => {
    const parseResult = fileParseMap[slug];
    const title = parseResult?.frontmatter.title || slug;
    const displayPath = `https://developers.portone.io/${slug}`;

    // description이 있는 경우 표준 형식에 맞게 추가
    if (parseResult?.frontmatter.description) {
      return `- [${title}](${displayPath}): ${parseResult.frontmatter.description}\n`;
    } else {
      return `- [${title}](${displayPath})\n`;
    }
  };

  // 릴리스 노트 링크 생성 함수
  const createReleaseNoteLink = (slug: string): string => {
    const displayPath = `https://developers.portone.io/${slug}`;
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

  // 문서 섹션 생성 함수
  const createDocSection = (
    title: string,
    files: string[],
    linkCreator: (slug: string) => string = createLinkWithDescription,
  ) => {
    if (files.length === 0) return "";

    let content = `\n## ${title}\n\n`;
    for (const slug of files) {
      content += linkCreator(slug);
    }
    return content;
  };

  // 버전별 문서 섹션 생성 함수
  const createVersionSection = (title: string, files: string[]) => {
    if (files.length === 0) return "";

    let content = `\n## ${title}\n\n`;

    // SDK 문서
    const sdkFiles = filterByCategory(files, PATH_PREFIXES.SDK);
    if (sdkFiles.length > 0) {
      content += `### ${title} SDK\n\n`;
      for (const slug of sdkFiles) {
        content += createLinkWithDescription(slug);
      }
    }

    // API 문서
    const apiFiles = filterByCategory(files, PATH_PREFIXES.API);
    if (apiFiles.length > 0) {
      content += `\n### ${title} API 레퍼런스\n\n`;
      for (const slug of apiFiles) {
        content += createLinkWithDescription(slug);
      }
    }

    // 통합 가이드 및 기타 문서
    const otherFiles = files.filter(
      (slug) =>
        !slug.startsWith(PATH_PREFIXES.SDK) &&
        !slug.startsWith(PATH_PREFIXES.API),
    );
    if (otherFiles.length > 0) {
      content += `\n### ${title} 통합 가이드\n\n`;
      for (const slug of otherFiles) {
        content += createLinkWithDescription(slug);
      }
    }

    return content;
  };

  // 마크다운 파일 생성 함수
  const generateMarkdownFile = async (filePath: string, content: string) => {
    await writeFile(filePath, content, "utf-8");
    console.log(`${filePath} 파일이 생성되었습니다.`);
  };

  // 문서 내용 생성 함수
  const generateDocContent = (slugs: string[]) => {
    let content = "";
    for (const slug of slugs) {
      const transformedAst = transformedAstMap[slug];
      if (transformedAst == null)
        throw new Error(`${slug}에 대한 AST를 찾을 수 없습니다.`);

      // 이미 변환된 AST를 사용하여 마크다운 생성
      const markdown = astToMarkdownString(
        transformedAst,
        fileParseMap[slug]?.frontmatter,
      );
      content += `\n\n# https://developers.portone.io/${slug}\n\n${markdown}`;
    }
    return content;
  };

  // 전체 문서 파일 생성 함수
  const generateFullDocFile = async (
    filePath: string,
    title: string,
    versionFiles: string[],
    includeCommon: boolean = true,
  ) => {
    let content = `# PortOne 개발자 문서 (${title})

> PortOne은 온라인 결제, 본인인증, 파트너 정산 자동화 및 재무/회계 업무를 위한 API와 SDK를 제공합니다.

## 목차

`;

    // 목차 생성
    const filesToInclude = [...versionFiles];
    if (includeCommon) {
      filesToInclude.push(...commonFiles);
    }
    if (platformFiles.length > 0) {
      filesToInclude.push(...platformFiles);
    }

    for (const slug of filesToInclude) {
      content += createLinkWithDescription(slug);
    }

    // 문서 내용 추가
    content += generateDocContent(filesToInclude);

    // 파일 저장
    await generateMarkdownFile(filePath, content);
  };

  // README.md 파일 내용 생성 (llms.txt와 동일한 내용)
  let readmeContent = `# PortOne 개발자 문서

> PortOne은 온라인 결제, 본인인증, 파트너 정산 자동화 및 재무/회계 업무를 위한 API와 SDK를 제공합니다.

`;

  // 공용 문서 섹션 추가
  readmeContent += `## 공통 문서 (V1 & V2)\n\n`;

  // 공용 SDK 문서
  const commonSdkFiles = filterByCategory(commonFiles, PATH_PREFIXES.SDK);
  if (commonSdkFiles.length > 0) {
    for (const slug of commonSdkFiles) {
      readmeContent += createLinkWithDescription(slug);
    }
  }

  // 공용 API 레퍼런스 문서
  const commonApiFiles = filterByCategory(commonFiles, PATH_PREFIXES.API);
  if (commonApiFiles.length > 0) {
    for (const slug of commonApiFiles) {
      readmeContent += createLinkWithDescription(slug);
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
      readmeContent += createLinkWithDescription(slug);
    }
  }

  // 버전별 문서 섹션 추가
  readmeContent += createVersionSection("V2 문서", v2Files);
  readmeContent += createVersionSection("V1 문서", v1Files);

  // 파트너정산, 릴리스 노트, 블로그 섹션 추가
  readmeContent += createDocSection("파트너정산", platformFiles);
  readmeContent += createDocSection(
    "릴리스 노트",
    releaseNoteFiles,
    createReleaseNoteLink,
  );
  readmeContent += createDocSection("블로그", blogFiles);

  // README.md 파일 저장
  const readmePath = join(docsForLlmsDir, "README.md");
  await generateMarkdownFile(readmePath, readmeContent);

  // 각 마크다운 파일을 docs-for-llms 디렉토리에 저장
  for (const slug of slugs) {
    try {
      const transformedAst = transformedAstMap[slug];
      if (transformedAst == null)
        throw new Error(`${slug}에 대한 AST 변환 결과를 찾을 수 없습니다.`);
      const frontmatter = fileParseMap[slug]?.frontmatter;

      // 마크다운 문자열로 변환
      const markdown = astToMarkdownString(transformedAst, frontmatter);

      // 저장할 파일 경로 생성
      const outputPath = join(docsForLlmsDir, `${slug}.md`);

      // 디렉토리 생성
      await mkdir(dirname(outputPath), { recursive: true });

      // 파일 저장
      await writeFile(outputPath, markdown, "utf-8");
    } catch (error) {
      console.error(`${slug} 마크다운 파일 저장 중 오류 발생:`, error);
    }
  }

  // 전체 문서 파일 생성
  await generateFullDocFile(
    join(docsForLlmsDir, "v1-docs-full.md"),
    "V1 전체 문서",
    v1Files,
  );

  await generateFullDocFile(
    join(docsForLlmsDir, "v2-docs-full.md"),
    "V2 전체 문서",
    v2Files,
  );

  return docsForLlmsDir;
}
