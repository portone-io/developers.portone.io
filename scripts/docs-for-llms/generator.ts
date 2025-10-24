import { exec } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import fastGlob from "fast-glob";
import type { Root } from "mdast";

import { astToMarkdownString } from "../mdx-to-markdown/index.ts";
import { type MdxParseResult } from "../mdx-to-markdown/mdx-parser.ts";
import {
  categorizeSlugs,
  PATH_PREFIXES,
  saveMarkdownFiles,
} from "../mdx-to-markdown/utils.ts";

// 프로젝트 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const guideForLlmsFilePath = join(
  rootDir,
  "scripts",
  "resources",
  "guide-for-llms.md",
);
const schemaDir = join(rootDir, "src", "schema");
const docsForLlmsDir = join(rootDir, "docs-for-llms");
const docsForLlmsSchemaDir = join(docsForLlmsDir, "schema");
const publicDir = join(rootDir, "public");

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
  const slugs = Object.keys(fileParseMap)
    // _components로 다른 마크다운 파일에서 사용된 것들 제외하기
    .filter((slug) => !slug.includes("_components"));

  // docs-for-llms 디렉토리 생성
  await mkdir(docsForLlmsDir, { recursive: true });

  // 각 마크다운 파일을 docs-for-llms 디렉토리에 저장
  await saveMarkdownFiles(fileParseMap, transformedAstMap, docsForLlmsDir);

  // schema 디렉토리 생성 및 파일 복사
  await mkdir(docsForLlmsSchemaDir, { recursive: true });
  try {
    // 스키마 디렉토리의 모든 파일을 복사
    const schemaFiles = await fastGlob("*", { cwd: schemaDir });
    await Promise.all(
      schemaFiles.map((file) =>
        cp(join(schemaDir, file), join(docsForLlmsSchemaDir, file)),
      ),
    );
    console.log(
      `총 ${schemaFiles.length}개의 스키마 파일이 ${docsForLlmsSchemaDir}로 복사되었습니다.`,
    );
  } catch (error) {
    console.error(`스키마 파일 복사 중 오류 발생:`, error);
  }

  // 파일 카테고리 분류 (공통 유틸리티 사용)
  const {
    releaseNoteSlugs,
    blogSlugs,
    platformSlugs,
    v1Slugs,
    v2Slugs,
    commonSlugs,
  } = categorizeSlugs(slugs, fileParseMap);

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
    slugs: string[],
    linkCreator: (slug: string) => string = createLinkWithDescription,
  ) => {
    if (slugs.length === 0) return "";

    let content = `\n## ${title}\n\n`;
    for (const slug of slugs) {
      content += linkCreator(slug);
    }
    return content;
  };

  // 버전별 문서 섹션 생성 함수
  const createVersionSection = (title: string, slugs: string[]) => {
    if (slugs.length === 0) return "";

    let content = `\n## ${title}\n\n`;

    // SDK 문서 (공통 유틸리티 사용)
    const sdkSlugs = slugs.filter((slug) => slug.startsWith(PATH_PREFIXES.SDK));
    if (sdkSlugs.length > 0) {
      content += `### ${title} SDK\n\n`;
      for (const slug of sdkSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    // API 문서 (공통 유틸리티 사용)
    const apiSlugs = slugs.filter((slug) => slug.startsWith(PATH_PREFIXES.API));
    if (apiSlugs.length > 0) {
      content += `\n### ${title} API 레퍼런스\n\n`;
      for (const slug of apiSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    // 통합 가이드 및 기타 문서
    const otherSlugs = slugs.filter(
      (slug) =>
        !slug.startsWith(PATH_PREFIXES.SDK) &&
        !slug.startsWith(PATH_PREFIXES.API),
    );
    if (otherSlugs.length > 0) {
      content += `\n### ${title} 통합 가이드\n\n`;
      for (const slug of otherSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    return content;
  };

  // 마크다운 파일 생성 함수
  const generateFile = async (filePath: string, content: string) => {
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

  // 스키마 파일 링크 생성 함수
  const createSchemaLinks = (version: string) => {
    let content = `\n### ${version} 스키마 파일\n\n`;

    if (version === "V1") {
      content += `- [V1 OpenAPI YAML](https://developers.portone.io/schema/v1.openapi.yml)\n`;
      content += `- [V1 OpenAPI JSON](https://developers.portone.io/schema/v1.openapi.json)\n`;
    } else if (version === "V2") {
      content += `- [V2 브라우저 SDK 스키마](https://developers.portone.io/schema/browser-sdk.yml)\n`;
      content += `- [V2 GraphQL 스키마](https://developers.portone.io/schema/v2.graphql)\n`;
      content += `- [V2 OpenAPI YAML](https://developers.portone.io/schema/v2.openapi.yml)\n`;
      content += `- [V2 OpenAPI JSON](https://developers.portone.io/schema/v2.openapi.json)\n`;
    }

    return content;
  };

  const guideForLlmsContent = await readFile(guideForLlmsFilePath, "utf-8");

  // 전체 문서 파일 생성 함수
  const generateFullDocFile = async (
    filePath: string,
    version: "V1" | "V2",
    includeCommon: boolean = true,
  ) => {
    let content = guideForLlmsContent;
    content += "\n## 목차\n";

    // 포함할 슬러그 목록 생성
    const slugsToInclude = [];

    // 스키마 파일 링크 추가
    if (version === "V1") {
      slugsToInclude.push(...v1Slugs);
      content += createSchemaLinks("V1");
    } else {
      slugsToInclude.push(...v2Slugs);
      content += createSchemaLinks("V2");
    }

    if (includeCommon) {
      slugsToInclude.push(...commonSlugs);
    }
    // 파트너정산, 릴리즈 노트, 블로그 컨텐츠 추가
    slugsToInclude.push(...platformSlugs, ...releaseNoteSlugs, ...blogSlugs);

    // SDK 문서 목차
    const sdkSlugs = slugsToInclude.filter((slug) =>
      slug.startsWith(PATH_PREFIXES.SDK),
    );
    if (sdkSlugs.length > 0) {
      content += `\n### ${version} SDK\n\n`;
      for (const slug of sdkSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    // API 문서 목차
    const apiSlugs = slugsToInclude.filter((slug) =>
      slug.startsWith(PATH_PREFIXES.API),
    );
    if (apiSlugs.length > 0) {
      content += `\n### ${version} API 레퍼런스\n\n`;
      for (const slug of apiSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    // 통합 가이드 및 기타 문서 목차
    const otherSlugs = slugsToInclude.filter(
      (slug) =>
        !slug.startsWith(PATH_PREFIXES.SDK) &&
        !slug.startsWith(PATH_PREFIXES.API) &&
        !slug.startsWith(PATH_PREFIXES.PLATFORM) &&
        !slug.startsWith(PATH_PREFIXES.RELEASE_NOTES) &&
        !slug.startsWith(PATH_PREFIXES.BLOG),
    );
    if (otherSlugs.length > 0) {
      content += `\n### ${version} 통합 가이드\n\n`;
      for (const slug of otherSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    // 파트너정산 문서 목차
    if (platformSlugs.length > 0) {
      content += `\n### 파트너정산\n\n`;
      for (const slug of platformSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    // 릴리즈 노트 목차
    if (releaseNoteSlugs.length > 0) {
      content += `\n### 릴리스 노트\n\n`;
      for (const slug of releaseNoteSlugs) {
        content += createReleaseNoteLink(slug);
      }
    }

    // 블로그 목차
    if (blogSlugs.length > 0) {
      content += `\n### 블로그\n\n`;
      for (const slug of blogSlugs) {
        content += createLinkWithDescription(slug);
      }
    }

    // 문서 내용 추가
    content += generateDocContent(slugsToInclude);

    // 파일 저장
    await generateFile(filePath, content);
  };

  // website-links.md 파일 내용 생성
  let websiteLinksContent = "";

  // 스키마 파일 추가
  websiteLinksContent += `\n## 스키마 파일\n`;
  websiteLinksContent += createSchemaLinks("V2");
  websiteLinksContent += createSchemaLinks("V1");

  // 공통 문서 섹션 추가
  websiteLinksContent += `\n## 공통 문서 (V1 & V2)\n\n`;

  // 공통 SDK 문서 (공통 유틸리티 사용)
  const commonSdkSlugs = commonSlugs.filter((slug) =>
    slug.startsWith(PATH_PREFIXES.SDK),
  );
  if (commonSdkSlugs.length > 0) {
    for (const slug of commonSdkSlugs) {
      websiteLinksContent += createLinkWithDescription(slug);
    }
  }

  // 공용 API 레퍼런스 문서 (공통 유틸리티 사용)
  const commonApiSlugs = commonSlugs.filter((slug) =>
    slug.startsWith(PATH_PREFIXES.API),
  );
  if (commonApiSlugs.length > 0) {
    for (const slug of commonApiSlugs) {
      websiteLinksContent += createLinkWithDescription(slug);
    }
  }

  // 기타 공용 문서
  const commonOtherSlugs = commonSlugs.filter(
    (slug) =>
      !slug.startsWith(PATH_PREFIXES.SDK) &&
      !slug.startsWith(PATH_PREFIXES.API),
  );
  if (commonOtherSlugs.length > 0) {
    for (const slug of commonOtherSlugs) {
      websiteLinksContent += createLinkWithDescription(slug);
    }
  }

  // 버전별 문서 섹션 추가
  websiteLinksContent += createVersionSection("V2 문서", v2Slugs);
  websiteLinksContent += createVersionSection("V1 문서", v1Slugs);

  // 파트너정산, 릴리스 노트, 블로그 섹션 추가
  websiteLinksContent += createDocSection("파트너정산", platformSlugs);
  websiteLinksContent += createDocSection(
    "릴리스 노트",
    releaseNoteSlugs,
    createReleaseNoteLink,
  );
  websiteLinksContent += createDocSection("블로그", blogSlugs);

  // 현재 날짜 생성
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
  // website-links.md frontmatter 생성
  const websiteLinksFrontmatter = `---
title: PortOne 개발자센터 웹사이트 링크 목록
description: PortOne 개발자센터 웹사이트 내 존재하는 문서들의 링크 목록을 제공합니다. 링크를 조회하고 싶은 경우 활용합니다.
targetVersions:
  - v1
  - v2
date: ${currentDate}
author: PortOne
---
`;

  await generateFile(
    join(docsForLlmsDir, "website-links.md"),
    websiteLinksFrontmatter + websiteLinksContent,
  );

  // guide-for-llms.md의 내용을 docs-for-llms/README.md로 추가
  await generateFile(join(docsForLlmsDir, "README.md"), guideForLlmsContent);

  // 전체 문서 파일 생성
  await generateFullDocFile(join(docsForLlmsDir, "v1-docs-full.md"), "V1");

  await generateFullDocFile(join(docsForLlmsDir, "v2-docs-full.md"), "V2");

  // 디렉토리를 zip 파일로 압축하고 public 디렉토리로 복사
  await compressAndCopyToPublic();

  return docsForLlmsDir;
}

/**
 * docs-for-llms 디렉토리를 zip 파일로 압축하여 public 디렉토리에 직접 저장하는 함수
 */
async function compressAndCopyToPublic(): Promise<void> {
  console.log("docs-for-llms 디렉토리를 압축하는 중...");

  try {
    // zip 파일 이름 설정
    const zipFileName = "docs-for-llms.zip";
    const publicZipFilePath = join(publicDir, zipFileName);

    // zip 명령어 실행 (macOS에 기본 내장) - 직접 public 디렉토리에 압축 파일 생성
    const cmd = `cd "${rootDir}" && zip -r "${publicZipFilePath}" docs-for-llms`;

    await promisify(exec)(cmd);

    console.log(`${zipFileName} 파일이 public 디렉토리에 생성되었습니다.`);
  } catch (error) {
    console.error("압축 중 오류 발생:", error);
    throw error;
  }
}
