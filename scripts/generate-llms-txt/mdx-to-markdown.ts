import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import fastGlob from "fast-glob";
import yaml from "js-yaml";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { type MdxParseResult, parseMdxFile } from "./mdx-parser";

// 프로젝트 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const outputDir = join(rootDir, "public", "llms");

/**
 * MDX 파일을 마크다운으로 변환하는 함수
 * @param parseResult MDX 파싱 결과
 * @returns 마크다운 문자열
 */
export async function convertMdxToMarkdown(
  parseResult: MdxParseResult,
): Promise<string> {
  // AST 복제 (원본 변경 방지)
  const ast = JSON.parse(JSON.stringify(parseResult.ast));

  // 프론트매터 문자열 생성
  let frontmatterStr = "";
  if (Object.keys(parseResult.frontmatter).length > 0) {
    frontmatterStr = `---\n${yaml.dump(parseResult.frontmatter)}---\n\n`;
  }

  // JSX 컴포넌트를 마크다운으로 변환
  transformJsxComponents(ast);

  // 임포트 구문 제거
  removeImports(ast);

  // YAML 노드 제거 (프론트매터는 별도로 처리)
  removeYamlNodes(ast);

  // JSX 요소 제거 또는 자식 노드만 유지
  simplifyJsxNodes(ast);

  // MDX 표현식 노드 처리
  handleMdxExpressions(ast);

  // 마크다운으로 변환
  const processor = unified()
    .use(remarkGfm) // GitHub Flavored Markdown 지원 (테이블 등)
    .use(remarkStringify, {
      bullet: "-",
      emphasis: "_",
      listItemIndent: "one",
      rule: "-",
      ruleSpaces: false,
      // 테이블 관련 설정
      tableCellPadding: true,
      tablePipeAlign: false,
      stringLength: () => 1, // 테이블 셀 너비 계산 단순화
    });

  const markdownContent = await processor.stringify(ast);

  // 프론트매터와 마크다운 내용 결합
  return frontmatterStr + markdownContent;
}

/**
 * MDX 표현식 노드를 처리하는 함수
 */
function handleMdxExpressions(ast: any): void {
  // MDX 텍스트 표현식 처리
  visit(ast, "mdxTextExpression", (node: any, index: number, parent: any) => {
    if (!parent || !Array.isArray(parent.children)) return;

    // 표현식을 텍스트 노드로 변환 (코드 내용을 주석으로 표시)
    const textNode = {
      type: "text",
      value: `[JS 표현식: ${node.value || ""}]`,
    };

    // 노드 교체
    parent.children.splice(index, 1, textNode);

    // 방문 인덱스 조정
    return index;
  });

  // MDX 플로우 표현식 처리
  visit(ast, "mdxFlowExpression", (node: any, index: number, parent: any) => {
    if (!parent || !Array.isArray(parent.children)) return;

    // 표현식을 코드 블록으로 변환
    const codeNode = {
      type: "code",
      lang: "js",
      value: `// MDX 표현식\n${node.value || ""}`,
    };

    // 노드 교체
    parent.children.splice(index, 1, codeNode);

    // 방문 인덱스 조정
    return index;
  });
}

/**
 * JSX 노드를 단순화하는 함수 (자식 노드만 유지)
 */
function simplifyJsxNodes(ast: any): void {
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: any, index: number, parent: any) => {
      if (!parent || !Array.isArray(parent.children)) return;

      // 자식 노드가 있으면 부모의 해당 위치에 자식 노드들을 삽입
      if (node.children && node.children.length > 0) {
        parent.children.splice(index, 1, ...node.children);
      } else {
        // 자식 노드가 없으면 제거
        parent.children.splice(index, 1);
      }

      // 방문 인덱스 조정 (노드가 교체되었으므로)
      return index;
    },
  );
}

/**
 * YAML 노드 제거 함수
 */
function removeYamlNodes(ast: any): void {
  const nodesToRemove: { parent: any; index: number }[] = [];

  visit(ast, "yaml", (node: any, index: number, parent: any) => {
    nodesToRemove.push({ parent, index });
  });

  // 역순으로 제거
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    const { parent, index } = nodesToRemove[i];
    if (parent && Array.isArray(parent.children)) {
      parent.children.splice(index, 1);
    }
  }
}

/**
 * JSX 컴포넌트를 마크다운으로 변환하는 함수
 * @param ast MDX AST
 */
function transformJsxComponents(ast: any): void {
  // 제거할 노드 인덱스 목록
  const nodesToRemove: { parent: any; index: number }[] = [];

  // JSX 컴포넌트 변환
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: any, index: number, parent: any) => {
      if (!node.name || !/^[A-Z]/.test(node.name)) {
        return;
      }

      // 컴포넌트 이름과 속성
      const componentName = node.name;
      const props: Record<string, any> = {};

      // 속성 추출
      if (node.attributes && Array.isArray(node.attributes)) {
        for (const attr of node.attributes) {
          if (attr.type === "mdxJsxAttribute" && attr.name) {
            // 문자열 값
            if (attr.value && typeof attr.value === "string") {
              props[attr.name] = attr.value;
            }
            // 표현식 값
            else if (
              attr.value &&
              attr.value.type === "mdxJsxAttributeValueExpression"
            ) {
              props[attr.name] = attr.value.value;
            }
            // 불리언 속성
            else {
              props[attr.name] = true;
            }
          }
        }
      }

      // 컴포넌트별 변환 처리
      let replacementNode: any = null;

      switch (componentName) {
        case "Figure":
          replacementNode = handleFigureComponent(node, props);
          break;
        case "Hint":
          replacementNode = handleHintComponent(node, props);
          break;
        case "Tabs":
          replacementNode = handleTabsComponent(node, props);
          break;
        case "Details":
          replacementNode = handleDetailsComponent(node, props);
          break;
        case "ContentRef":
          replacementNode = handleContentRefComponent(node, props);
          break;
        case "VersionGate":
          replacementNode = handleVersionGateComponent(node, props);
          break;
        case "Youtube":
          replacementNode = handleYoutubeComponent(node, props);
          break;
        case "Parameter":
          replacementNode = handleParameterComponent(node, props);
          break;
        case "Swagger":
        case "SwaggerDescription":
        case "SwaggerParameter":
          // Swagger 관련 컴포넌트는 생략
          nodesToRemove.push({ parent, index });
          return;
        default:
          // 기본적으로 자식 노드만 유지
          replacementNode = {
            type: "root",
            children: node.children || [],
          };
      }

      if (replacementNode) {
        // 노드 교체
        Object.keys(replacementNode).forEach((key) => {
          if (key !== "type") {
            node[key] = replacementNode[key];
          }
        });
        node.type = replacementNode.type;
      } else {
        // 교체 노드가 없으면 제거 목록에 추가
        nodesToRemove.push({ parent, index });
      }
    },
  );

  // 제거할 노드 처리 (역순으로 제거하여 인덱스 변화 방지)
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    const { parent, index } = nodesToRemove[i];
    if (parent && Array.isArray(parent.children)) {
      parent.children.splice(index, 1);
    }
  }
}

/**
 * Figure 컴포넌트 처리
 */
function handleFigureComponent(node: any, _props: Record<string, any>): any {
  // 이미지 URL과 캡션 추출
  const src = node.attributes?.src || "";
  const caption = node.attributes?.caption || "";

  // 마크다운 이미지로 변환
  return {
    type: "paragraph",
    children: [
      {
        type: "image",
        url: src,
        alt: caption,
        title: caption,
      },
      ...(caption
        ? [
            { type: "text", value: "\n" },
            { type: "emphasis", children: [{ type: "text", value: caption }] },
          ]
        : []),
    ],
  };
}

/**
 * Hint 컴포넌트 처리
 */
function handleHintComponent(node: any, props: Record<string, any>): any {
  // 스타일에 따른 이모지 매핑
  const styleToEmoji: Record<string, string> = {
    info: "ℹ️",
    warning: "⚠️",
    success: "✅",
    danger: "🚨",
  };

  const style = props.style || "info";
  const emoji = styleToEmoji[style] || styleToEmoji.info;

  // 블록 인용구로 변환
  return {
    type: "blockquote",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", value: `${emoji} ` },
          ...(node.children || []),
        ],
      },
    ],
  };
}

/**
 * Tabs 컴포넌트 처리
 */
function handleTabsComponent(node: any, _props: Record<string, any>): any {
  // 탭 컴포넌트의 자식 노드 처리
  const tabNodes: any[] = [];

  // 각 탭 처리
  visit(
    node,
    { type: "mdxJsxFlowElement", name: "Tabs.Tab" },
    (tabNode: any) => {
      const tabProps: Record<string, any> = {};

      // 탭 속성 추출
      if (tabNode.attributes && Array.isArray(tabNode.attributes)) {
        for (const attr of tabNode.attributes) {
          if (attr.type === "mdxJsxAttribute" && attr.name) {
            if (attr.value && typeof attr.value === "string") {
              tabProps[attr.name] = attr.value;
            } else if (
              attr.value &&
              attr.value.type === "mdxJsxAttributeValueExpression"
            ) {
              tabProps[attr.name] = attr.value.value;
            } else {
              tabProps[attr.name] = true;
            }
          }
        }
      }

      const title = tabProps.title || "탭";

      tabNodes.push({
        type: "heading",
        depth: 4,
        children: [{ type: "text", value: title }],
      });

      tabNodes.push({
        type: "root",
        children: tabNode.children || [],
      });
    },
  );

  // 탭 내용을 순차적으로 나열
  return {
    type: "root",
    children: tabNodes.flatMap((node) =>
      node.type === "root" ? node.children : [node],
    ),
  };
}

/**
 * Details 컴포넌트 처리
 */
function handleDetailsComponent(node: any, _props: Record<string, any>): any {
  let summary = "";
  let content: any[] = [];

  // Summary와 Content 컴포넌트 찾기
  visit(
    node,
    { type: "mdxJsxFlowElement", name: "Details.Summary" },
    (summaryNode: any) => {
      // 요약 텍스트 추출
      if (summaryNode.children && summaryNode.children.length > 0) {
        const textNodes = summaryNode.children.filter(
          (child: any) =>
            child.type === "text" ||
            (child.type === "paragraph" &&
              child.children &&
              child.children.some((c: any) => c.type === "text")),
        );

        if (textNodes.length > 0) {
          summary = textNodes
            .map((textNode: any) => {
              if (textNode.type === "text") {
                return textNode.value;
              } else if (textNode.type === "paragraph") {
                return textNode.children
                  .filter((c: any) => c.type === "text")
                  .map((c: any) => c.value)
                  .join("");
              }
              return "";
            })
            .join(" ");
        }
      }
    },
  );

  visit(
    node,
    { type: "mdxJsxFlowElement", name: "Details.Content" },
    (contentNode: any) => {
      content = contentNode.children || [];
    },
  );

  // 제목과 내용 순서대로 표시
  return {
    type: "root",
    children: [
      {
        type: "heading",
        depth: 4,
        children: [{ type: "text", value: summary || "상세 정보" }],
      },
      ...content,
    ],
  };
}

/**
 * ContentRef 컴포넌트 처리
 */
function handleContentRefComponent(node: any, props: Record<string, any>): any {
  const url = props.url || "";
  const title = props.title || url;

  // 링크로 변환
  return {
    type: "paragraph",
    children: [
      {
        type: "link",
        url,
        title,
        children: [{ type: "text", value: title }],
      },
    ],
  };
}

/**
 * VersionGate 컴포넌트 처리
 */
function handleVersionGateComponent(
  node: any,
  props: Record<string, any>,
): any {
  // 버전 정보 추출
  const version = props.version || "";

  // 버전 정보와 함께 내용 표시
  return {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: `버전 ${version}:` }],
      },
      ...(node.children || []),
    ],
  };
}

/**
 * Youtube 컴포넌트 처리
 */
function handleYoutubeComponent(node: any, _props: Record<string, any>): any {
  const id = node.attributes?.id || "";
  const url = `https://www.youtube.com/watch?v=${id}`;

  // 유튜브 링크로 변환
  return {
    type: "paragraph",
    children: [
      {
        type: "link",
        url,
        title: "YouTube 비디오",
        children: [{ type: "text", value: "YouTube 비디오 보기" }],
      },
    ],
  };
}

/**
 * Parameter 컴포넌트 처리
 */
function handleParameterComponent(
  _node: any,
  _props: Record<string, any>,
): any {
  // Parameter 컴포넌트는 생략
  return {
    type: "root",
    children: [],
  };
}

/**
 * 임포트 구문 제거
 */
function removeImports(ast: any): void {
  const nodesToRemove: { parent: any; index: number }[] = [];

  visit(ast, "mdxjsEsm", (node: any, index: number, parent: any) => {
    nodesToRemove.push({ parent, index });
  });

  // 역순으로 제거
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    const { parent, index } = nodesToRemove[i];
    if (parent && Array.isArray(parent.children)) {
      parent.children.splice(index, 1);
    }
  }
}

/**
 * 모든 MDX 파일을 파싱하고 결과를 맵으로 반환하는 함수
 * @returns 파일 경로(slug)와 파싱 결과를 매핑한 Map 객체
 */
export async function parseAllMdxFiles(): Promise<Map<string, MdxParseResult>> {
  // MDX 파일 찾기
  const mdxFiles = await fastGlob(["src/routes/**/*.mdx"], {
    cwd: rootDir,
  });

  console.log(`총 ${mdxFiles.length}개의 MDX 파일을 찾았습니다.`);

  // 파일 경로와 파싱 결과를 매핑할 Map 객체
  const fileParseMap = new Map<string, MdxParseResult>();

  // 각 MDX 파일 처리
  for (const mdxFile of mdxFiles) {
    try {
      // MDX 파싱
      const parseResult = await parseMdxFile(mdxFile);

      // Map에 파싱 결과 저장 (slug를 키로 사용)
      fileParseMap.set(parseResult.slug, parseResult);
    } catch (error) {
      console.error(`${mdxFile} 파싱 중 오류 발생:`, error);
    }
  }

  return fileParseMap;
}

/**
 * 모든 MDX 파일을 마크다운으로 변환하고 저장하는 함수
 * @param fileParseMap 파일 경로와 파싱 결과를 매핑한 Map 객체
 */
export async function convertAllMdxToMarkdown(
  fileParseMap: Map<string, MdxParseResult>,
): Promise<void> {
  // 각 파싱 결과를 마크다운으로 변환하여 저장
  for (const [slug, parseResult] of fileParseMap.entries()) {
    try {
      // 마크다운으로 변환
      const markdown = await convertMdxToMarkdown(parseResult);

      // 출력 경로 생성
      const outputRelativePath = `${slug}.md`;
      const outputPath = join(outputDir, outputRelativePath);

      // 디렉토리 생성
      await mkdir(dirname(outputPath), { recursive: true });

      // 파일 저장
      await writeFile(outputPath, markdown, "utf-8");

      console.log(`변환 완료: ${parseResult.filePath} -> ${outputPath}`);
    } catch (error) {
      console.error(`${parseResult.filePath} 변환 중 오류 발생:`, error);
    }
  }

  console.log("모든 MDX 파일 변환이 완료되었습니다.");
}

/**
 * 모든 마크다운 파일을 읽고 llms.txt 파일을 생성하는 함수
 * @param fileParseMap MDX 파싱 결과 맵
 * @returns 생성된 llms.txt 파일 경로
 */
export async function generateLlmsTxtFiles(
  fileParseMap: Map<string, MdxParseResult>,
): Promise<string> {
  // fileParseMap에서 slug 추출
  const slugs = Array.from(fileParseMap.keys());

  console.log(`총 ${slugs.length}개의 문서를 찾았습니다.`);

  // 문서 카테고리 경로 접두사 정의
  const PATH_PREFIXES = {
    RELEASE_NOTES: "release-notes/",
    BLOG: "blog/posts/",
    SDK: "sdk/",
    API_REFERENCE: "api-reference/",
    PLATFORM: "platform/",
  };

  // 릴리즈 노트, 블로그, 파트너정산 파일 먼저 필터링
  const releaseNoteFiles = slugs.filter((slug) =>
    slug.startsWith(PATH_PREFIXES.RELEASE_NOTES),
  );
  const blogFiles = slugs.filter((slug) => slug.startsWith(PATH_PREFIXES.BLOG));
  const platformFiles = slugs.filter((slug) =>
    slug.startsWith(PATH_PREFIXES.PLATFORM),
  );

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
    const parseResult = fileParseMap.get(slug);
    const targetVersions = parseResult?.frontmatter.targetVersions || [];

    // targetVersions가 ["v1", "v2"] 이거나 빈 배열이면 공용 문서로 취급
    if (
      targetVersions.length === 0 ||
      (targetVersions.includes("v1") && targetVersions.includes("v2"))
    ) {
      commonFiles.push(slug);
    }
    // targetVersions가 ["v1"]만 있으면 v1 문서로 취급
    else if (targetVersions.includes("v1") && !targetVersions.includes("v2")) {
      v1Files.push(slug);
    }
    // targetVersions가 ["v2"]만 있으면 v2 문서로 취급
    else if (targetVersions.includes("v2") && !targetVersions.includes("v1")) {
      v2Files.push(slug);
    }
    // 그 외의 경우 (예: 다른 버전이 명시된 경우) 공용 문서로 취급
    else {
      commonFiles.push(slug);
    }
  }

  // 카테고리별 필터링 함수
  const filterByCategory = (files: string[], categoryPrefix: string) => {
    return files.filter((slug) => slug.startsWith(categoryPrefix));
  };

  // 링크 생성 헬퍼 함수
  const createLinkWithDescription = (slug: string): string => {
    const parseResult = fileParseMap.get(slug);
    const title = parseResult?.frontmatter.title || slug;
    const displayPath = `${slug}.md`;

    // description이 있는 경우 표준 형식에 맞게 추가
    if (parseResult?.frontmatter.description) {
      return `- [${title}](${displayPath}): ${parseResult.frontmatter.description}\n`;
    } else {
      return `- [${title}](${displayPath})\n`;
    }
  };

  // llms.txt 파일 내용 생성
  let llmsTxtContent = `# PortOne 개발자 문서

> PortOne은 온라인 결제, 본인인증, 파트너정산 및 재무/회계 업무를 위한 API와 SDK를 제공합니다.

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
  const commonApiFiles = filterByCategory(
    commonFiles,
    PATH_PREFIXES.API_REFERENCE,
  );
  if (commonApiFiles.length > 0) {
    for (const slug of commonApiFiles) {
      llmsTxtContent += createLinkWithDescription(slug);
    }
  }

  // 기타 공용 문서 (platform/ 제외)
  const commonOtherFiles = commonFiles.filter(
    (slug) =>
      !slug.startsWith(PATH_PREFIXES.SDK) &&
      !slug.startsWith(PATH_PREFIXES.API_REFERENCE),
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

    // V2 API 레퍼런스 문서
    const v2ApiFiles = filterByCategory(v2Files, PATH_PREFIXES.API_REFERENCE);
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
        !slug.startsWith(PATH_PREFIXES.API_REFERENCE),
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
    const v1ApiFiles = filterByCategory(v1Files, PATH_PREFIXES.API_REFERENCE);
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
        !slug.startsWith(PATH_PREFIXES.API_REFERENCE),
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
      llmsTxtContent += createLinkWithDescription(slug);
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
    const parseResult = fileParseMap.get(slug);
    if (parseResult) {
      // 마크다운으로 변환
      const markdown = await convertMdxToMarkdown(parseResult);
      fullContent += `\n\n# ${slug}\n\n${markdown}`;
    }
  }
  const llmsFullTxtPath = join(rootDir, "public", "llms-full.txt");
  await writeFile(llmsFullTxtPath, fullContent, "utf-8");
  console.log(`llms-full.txt 파일이 생성되었습니다: ${llmsFullTxtPath}`);

  // llms-small.txt 파일 생성 (처음 10개 문서만 포함)
  let smallContent = llmsTxtContent;
  for (const slug of slugs.slice(0, 10)) {
    const parseResult = fileParseMap.get(slug);
    if (parseResult) {
      // 마크다운으로 변환
      const markdown = await convertMdxToMarkdown(parseResult);
      smallContent += `\n\n# ${slug}\n\n${markdown}`;
    }
  }
  const llmsSmallTxtPath = join(rootDir, "public", "llms-small.txt");
  await writeFile(llmsSmallTxtPath, smallContent, "utf-8");
  console.log(`llms-small.txt 파일이 생성되었습니다: ${llmsSmallTxtPath}`);

  return llmsTxtPath;
}
