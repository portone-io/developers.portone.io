import yaml from "js-yaml";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { type MdxParseResult } from "./mdx-parser";

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
    } as any); // 타입 오류 해결을 위한 any 타입 캐스팅

  const markdownContent = await processor.stringify(ast);

  // 프론트매터와 마크다운 내용 결합
  return frontmatterStr + markdownContent;
}

/**
 * MDX 표현식 노드를 처리하는 함수
 */
function handleMdxExpressions(ast: any): void {
  // MDX 텍스트 표현식 처리
  visit(
    ast,
    "mdxTextExpression",
    (node: any, index: number | undefined, parent: any) => {
      if (!parent || !Array.isArray(parent.children) || index === undefined)
        return;

      // 표현식을 텍스트 노드로 변환 (코드 내용을 주석으로 표시)
      const textNode = {
        type: "text",
        value: `[JS 표현식: ${node.value || ""}]`,
      };

      // 노드 교체
      parent.children.splice(index, 1, textNode);

      // 방문 인덱스 조정
      return index;
    },
  );

  // MDX 플로우 표현식 처리
  visit(
    ast,
    "mdxFlowExpression",
    (node: any, index: number | undefined, parent: any) => {
      if (!parent || !Array.isArray(parent.children) || index === undefined)
        return;

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
    },
  );
}

/**
 * JSX 노드를 단순화하는 함수 (자식 노드만 유지)
 */
function simplifyJsxNodes(ast: any): void {
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: any, index: number | undefined, parent: any) => {
      if (!parent || !Array.isArray(parent.children) || index === undefined)
        return;

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
  const nodesToRemove: Array<{ parent: any; index: number }> = [];

  visit(ast, "yaml", (node: any, index: number | undefined, parent: any) => {
    if (index !== undefined) {
      nodesToRemove.push({ parent, index });
    }
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
  const nodesToRemove: Array<{ parent: any; index: number }> = [];

  // JSX 컴포넌트 변환
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: any, index: number | undefined, parent: any) => {
      if (!node.name || !/^[A-Z]/.test(node.name) || index === undefined) {
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
export function handleFigureComponent(
  node: any,
  _props: Record<string, any>,
): any {
  // 이미지 캡션 추출
  const caption = node.attributes?.caption || "";

  // '(이미지 첨부: {caption})' 형태로 변환
  return {
    type: "paragraph",
    children: [
      {
        type: "text",
        value: caption ? `(이미지 첨부: ${caption})` : "(관련 이미지 첨부)",
      },
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
  const nodesToRemove: Array<{ parent: any; index: number }> = [];

  visit(
    ast,
    "mdxjsEsm",
    (node: any, index: number | undefined, parent: any) => {
      if (index !== undefined) {
        nodesToRemove.push({ parent, index });
      }
    },
  );

  // 역순으로 제거
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    const { parent, index } = nodesToRemove[i];
    if (parent && Array.isArray(parent.children)) {
      parent.children.splice(index, 1);
    }
  }
}
