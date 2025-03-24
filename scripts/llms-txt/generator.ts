import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { Root } from "mdast";

import { astToMarkdownString } from "../mdx-to-markdown";
import { type MdxParseResult } from "../mdx-to-markdown/mdx-parser";
import {
  categorizeSlugs,
  filterSlugsByCategory,
  PATH_PREFIXES,
} from "../mdx-to-markdown/utils";

/**
 * 모든 마크다운 파일을 읽고 llms.txt 파일을 생성하는 함수
 * 변환된 AST 노드를 재사용하여 llms.txt, llms-full.txt, llms-small.txt 파일을 생성
 * @param fileParseMap MDX 파싱 결과 맵
 * @param transformedAstMap 변환된 AST 노드 맵
 * @param outputDir 생성된 파일을 저장할 대상 디렉토리
 * @returns 생성된 llms.txt 파일 경로
 */
export async function generateLlmsTxtFiles(
  fileParseMap: Record<string, MdxParseResult>,
  transformedAstMap: Record<string, Root>,
  outputDir: string,
): Promise<string> {
  // fileParseMap에서 slug 추출
  const slugs = Object.keys(fileParseMap);

  console.log(`총 ${slugs.length}개의 문서를 찾았습니다.`);

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
    const displayPath = `https://developers.portone.io/${slug}.md`;

    // description이 있는 경우 표준 형식에 맞게 추가
    if (parseResult?.frontmatter.description) {
      return `- [${title}](${displayPath}): ${parseResult.frontmatter.description}\n`;
    } else {
      return `- [${title}](${displayPath})\n`;
    }
  };

  // 릴리스 노트 링크 생성 함수
  const createReleaseNoteLink = (slug: string): string => {
    const displayPath = `https://developers.portone.io/${slug}.md`;
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

## 스키마 파일

- [V2 브라우저 SDK 스키마](https://developers.portone.io/schema/browser-sdk.yml)
- [V2 GraphQL 스키마](https://developers.portone.io/schema/v2.graphql)
- [V2 OpenAPI 스키마 (YAML)](https://developers.portone.io/schema/v2.openapi.yml)
- [V2 OpenAPI 스키마 (JSON)](https://developers.portone.io/schema/v2.openapi.json)
- [V1 OpenAPI 스키마 (YAML)](https://developers.portone.io/schema/v1.openapi.yml)
- [V1 OpenAPI 스키마 (JSON)](https://developers.portone.io/schema/v1.openapi.json)

`;

  // 공용 문서 섹션 추가
  llmsTxtContent += `## 공통 문서 (V1 & V2)\n\n`;

  // 공용 SDK 문서
  const commonSdkSlugs = filterSlugsByCategory(commonSlugs, PATH_PREFIXES.SDK);
  if (commonSdkSlugs.length > 0) {
    for (const slug of commonSdkSlugs) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // 공용 API 레퍼런스 문서
  const commonApiSlugs = filterSlugsByCategory(commonSlugs, PATH_PREFIXES.API);
  if (commonApiSlugs.length > 0) {
    for (const slug of commonApiSlugs) {
      llmsTxtContent += createLinkWithDescription(slug);
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
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // V2 문서 섹션 추가
  if (v2Slugs.length > 0) {
    llmsTxtContent += `\n## V2 문서\n\n`;

    // V2 SDK 문서
    const v2SdkSlugs = filterSlugsByCategory(v2Slugs, PATH_PREFIXES.SDK);
    if (v2SdkSlugs.length > 0) {
      llmsTxtContent += `### V2 SDK\n\n`;
      for (const slug of v2SdkSlugs) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V2 API 문서
    const v2ApiSlugs = filterSlugsByCategory(v2Slugs, PATH_PREFIXES.API);
    if (v2ApiSlugs.length > 0) {
      llmsTxtContent += `\n### V2 API 레퍼런스\n\n`;
      for (const slug of v2ApiSlugs) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V2 통합 가이드 및 기타 문서
    const v2OtherSlugs = v2Slugs.filter(
      (slug) =>
        !slug.startsWith(PATH_PREFIXES.SDK) &&
        !slug.startsWith(PATH_PREFIXES.API),
    );
    if (v2OtherSlugs.length > 0) {
      llmsTxtContent += `\n### V2 통합 가이드\n\n`;
      for (const slug of v2OtherSlugs) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }
  }

  // V1 문서 섹션 추가
  if (v1Slugs.length > 0) {
    llmsTxtContent += `\n## V1 문서\n\n`;

    // V1 SDK 문서
    const v1SdkSlugs = filterSlugsByCategory(v1Slugs, PATH_PREFIXES.SDK);
    if (v1SdkSlugs.length > 0) {
      llmsTxtContent += `### V1 SDK\n\n`;
      for (const slug of v1SdkSlugs) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V1 API 레퍼런스 문서
    const v1ApiSlugs = filterSlugsByCategory(v1Slugs, PATH_PREFIXES.API);
    if (v1ApiSlugs.length > 0) {
      llmsTxtContent += `\n### V1 API 레퍼런스\n\n`;
      for (const slug of v1ApiSlugs) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }

    // V1 통합 가이드 및 기타 문서
    const v1OtherSlugs = v1Slugs.filter(
      (slug) =>
        !slug.startsWith(PATH_PREFIXES.SDK) &&
        !slug.startsWith(PATH_PREFIXES.API),
    );
    if (v1OtherSlugs.length > 0) {
      llmsTxtContent += `\n### V1 통합 가이드\n\n`;
      for (const slug of v1OtherSlugs) {
        llmsTxtContent += createLinkWithDescription(slug);
      }
    }
  }

  // 파트너정산 섹션 추가 (platform/ 하위 문서)
  if (platformSlugs.length > 0) {
    llmsTxtContent += `\n## 파트너정산\n\n`;
    for (const slug of platformSlugs) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // 릴리스 노트 섹션 추가
  if (releaseNoteSlugs.length > 0) {
    llmsTxtContent += `\n## 릴리스 노트\n\n`;
    for (const slug of releaseNoteSlugs) {
      llmsTxtContent += createReleaseNoteLink(slug);
    }
  }

  // 블로그 섹션 추가
  if (blogSlugs.length > 0) {
    llmsTxtContent += `\n## 블로그\n\n`;
    for (const slug of blogSlugs) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // llms.txt 파일 저장
  const llmsTxtPath = join(outputDir, "llms.txt");
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
    fullContent += `\n\n# https://developers.portone.io/${slug}.md\n\n${markdown}`;
  }
  const llmsFullTxtPath = join(outputDir, "llms-full.txt");
  await writeFile(llmsFullTxtPath, fullContent, "utf-8");
  console.log(`llms-full.txt 파일이 생성되었습니다: ${llmsFullTxtPath}`);

  // llms-small.txt 파일 생성 (llms.txt와 동일한 내용으로)
  // llms.txt의 내용을 그대로 사용합니다
  const llmsSmallTxtPath = join(outputDir, "llms-small.txt");
  await writeFile(llmsSmallTxtPath, llmsTxtContent, "utf-8");
  console.log(`llms-small.txt 파일이 생성되었습니다: ${llmsSmallTxtPath}`);

  return llmsTxtPath;
}

/**
 * src/schema 디렉토리의 모든 파일을 public/schema 디렉토리로 복사하는 함수
 *
 * @param rootDir 프로젝트의 루트 디렉토리
 * @param outputDir 복사할 대상 디렉토리
 * @returns 복사된 파일 경로의 배열
 */
export async function copySchemaFiles(
  rootDir: string,
  outputDir: string,
): Promise<string[]> {
  // 소스 및 대상 디렉토리 경로 설정
  const sourceDir = join(rootDir, "src", "schema");
  const targetDir = join(outputDir, "schema");

  console.log(`스키마 파일을 복사합니다: ${sourceDir} -> ${targetDir}`);

  // 대상 디렉토리 생성 (없는 경우)
  await mkdir(targetDir, { recursive: true });

  // 소스 디렉토리의 모든 파일 읽기
  const files = await readdir(sourceDir);
  const copiedFiles: string[] = [];

  // 각 파일을 대상 디렉토리로 복사
  for (const file of files) {
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);

    try {
      await copyFile(sourcePath, targetPath);
      copiedFiles.push(targetPath);
      console.log(`스키마 파일 복사 완료: ${sourcePath} -> ${targetPath}`);
    } catch (error) {
      console.error(`스키마 파일 복사 중 오류 발생: ${sourcePath}`, error);
    }
  }

  console.log(`총 ${copiedFiles.length}개의 스키마 파일이 복사되었습니다.`);
  return copiedFiles;
}
