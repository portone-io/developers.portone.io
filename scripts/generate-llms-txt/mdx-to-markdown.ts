import yaml from "js-yaml";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { type MdxParseResult } from "./mdx-parser";

/**
 * MDX JSX 속성을 추출하는 함수
 * @param node MDX JSX 노드
 * @returns 추출된 속성 객체
 */
function extractMdxJsxAttributes(node: any): Record<string, any> {
  const props: Record<string, any> = {};
  if (node.attributes && Array.isArray(node.attributes)) {
    for (const attr of node.attributes) {
      if (attr.type === "mdxJsxAttribute" && attr.name) {
        if (attr.value && typeof attr.value === "string") {
          props[attr.name] = attr.value;
        } else if (
          attr.value &&
          attr.value.type === "mdxJsxAttributeValueExpression"
        ) {
          props[attr.name] = attr.value.value;
        } else {
          props[attr.name] = true;
        }
      }
    }
  }
  return props;
}

/**
 * MDX 파일을 마크다운으로 변환하는 함수
 * @param slug 변환할 MDX 파일의 slug
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵 (slug -> MdxParseResult)
 * @returns 마크다운 문자열
 */
export async function convertMdxToMarkdown(
  slug: string,
  parseResultMap: Record<string, MdxParseResult>,
): Promise<string> {
  // slug에 해당하는 parseResult 가져오기
  const parseResult = parseResultMap[slug];

  // parseResult가 없으면 빈 문자열 반환
  if (!parseResult) {
    console.warn(
      `[convertMdxToMarkdown] parseResult not found for slug: ${slug}`,
    );
    return "";
  }

  // AST 복제 (원본 변경 방지)
  const ast = JSON.parse(JSON.stringify(parseResult.ast));

  // 프론트매터 문자열 생성
  let frontmatterStr = "";
  if (Object.keys(parseResult.frontmatter).length > 0) {
    frontmatterStr = `---\n${yaml.dump(parseResult.frontmatter)}---\n\n`;
  }

  // JSX 컴포넌트를 마크다운으로 변환
  transformJsxComponents(ast, parseResultMap);

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
    const item = nodesToRemove[i];
    if (item && item.parent && Array.isArray(item.parent.children)) {
      item.parent.children.splice(item.index, 1);
    }
  }
}

/**
 * JSX 컴포넌트를 마크다운으로 변환하는 함수
 * @param ast MDX AST
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵 (slug -> MdxParseResult)
 */
function transformJsxComponents(
  ast: any,
  parseResultMap: Record<string, MdxParseResult>,
): void {
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

      // 속성 추출
      const props = extractMdxJsxAttributes(node);

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
          replacementNode = handleContentRefComponent(
            node,
            props,
            parseResultMap,
          );
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
    const item = nodesToRemove[i];
    if (item && item.parent && Array.isArray(item.parent.children)) {
      item.parent.children.splice(item.index, 1);
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
export function handleHintComponent(
  node: any,
  props: Record<string, any>,
): any {
  // 속성 문자열 생성
  let classNames = "hint";
  let attributesStr = "";

  // 모든 속성 처리
  Object.entries(props).forEach(([key, value]) => {
    if (value !== undefined) {
      // type 속성은 클래스로 추가
      if (key === "type") {
        classNames += ` hint-${value}`;
      } else {
        // 나머지 속성은 data-* 속성으로 추가
        const valueStr =
          typeof value === "string" ? value : JSON.stringify(value);
        attributesStr += `data-${key}="${valueStr}" `;
      }
    }
  });

  attributesStr = attributesStr.trim();

  // HTML div 시작 태그
  const hintStartDiv = {
    type: "html",
    value: `<div class="${classNames}"${attributesStr ? ` ${attributesStr}` : ""}>`,
  };

  // HTML div 종료 태그
  const hintEndDiv = {
    type: "html",
    value: "</div>",
  };

  // 원래 자식 노드들
  const children = node.children || [];

  // 시작 태그, 원래 자식 노드들, 종료 태그를 포함하는 배열 생성
  const newChildren = [hintStartDiv, ...children, hintEndDiv];

  // 루트 노드 반환
  return {
    type: "root",
    children: newChildren,
  };
}

/**
 * Tabs 컴포넌트 처리
 */
export function handleTabsComponent(
  node: any,
  _props: Record<string, any>,
): any {
  // 탭 컴포넌트 전체를 감싸는 div 시작 태그
  const tabsStartDiv = {
    type: "html",
    value: `<div class="tabs-container">`,
  };

  // 탭 컴포넌트 전체를 감싸는 div 종료 태그
  const tabsEndDiv = {
    type: "html",
    value: "</div>",
  };

  const tabContents: any[] = [];

  // 각 탭 처리
  visit(
    node,
    { type: "mdxJsxFlowElement", name: "Tabs.Tab" },
    (tabNode: any) => {
      // 탭 속성 추출
      const tabProps = extractMdxJsxAttributes(tabNode);

      const title = tabProps.title || "탭";

      // 탭 콘텐츠 시작 태그
      const tabContentStartDiv = {
        type: "html",
        value: `<div class="tabs-content" data-title="${title}">`,
      };

      // 탭 콘텐츠 종료 태그
      const tabContentEndDiv = {
        type: "html",
        value: "</div>",
      };

      // 탭 콘텐츠에 자식 노드들 추가
      tabContents.push(tabContentStartDiv);
      tabContents.push(...(tabNode.children || []));
      tabContents.push(tabContentEndDiv);
    },
  );

  // 모든 요소를 순서대로 배치
  return {
    type: "root",
    children: [tabsStartDiv, ...tabContents, tabsEndDiv],
  };
}

/**
 * Details 컴포넌트 처리
 */
export function handleDetailsComponent(
  node: any,
  _props: Record<string, any>,
): any {
  // 결과 노드들을 저장할 배열
  const resultNodes: any[] = [];

  // Summary와 Content 노드 찾기
  let summaryNode = null;
  let contentNode = null;

  // 자식 노드들을 순회하면서 Summary와 Content 컴포넌트 찾기
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.type === "mdxJsxFlowElement") {
        if (child.name === "Details.Summary") {
          summaryNode = child;
        } else if (child.name === "Details.Content") {
          contentNode = child;
        }
      }
    }
  }

  // details 시작 태그
  resultNodes.push({
    type: "html",
    value: "<details>",
  });

  // summary 시작 태그
  resultNodes.push({
    type: "html",
    value: "<summary>",
  });

  // Summary 내용 추가 (AST 구조 유지)
  if (summaryNode && summaryNode.children && summaryNode.children.length > 0) {
    resultNodes.push(...summaryNode.children);
  } else {
    // 기본 Summary 텍스트
    resultNodes.push({
      type: "text",
      value: "상세 정보",
    });
  }

  // summary 종료 태그
  resultNodes.push({
    type: "html",
    value: "</summary>",
  });

  // Content 내용 추가
  if (contentNode && contentNode.children) {
    resultNodes.push(...contentNode.children);
  }

  // details 닫기
  resultNodes.push({
    type: "html",
    value: "</details>",
  });

  return {
    type: "root",
    children: resultNodes,
  };
}

/**
 * ContentRef 컴포넌트 처리
 */
export function handleContentRefComponent(
  _node: any,
  props: Record<string, any>,
  parseResultMap: Record<string, MdxParseResult>,
): any {
  const slug = props.slug ? props.slug.replace(/^\//, "") : "";
  let title;

  // slug에 해당하는 문서가 있으면 해당 문서의 frontmatter title 사용
  if (slug && parseResultMap[slug]) {
    const targetDoc = parseResultMap[slug];
    title = targetDoc?.frontmatter.title;
  }

  // title이 여전히 없으면 slug 사용
  if (!title) {
    title = "링크";
  }

  // 마크다운 링크로 변환
  return {
    type: "paragraph",
    children: [
      {
        type: "link",
        url: `/llms/${slug}.md`,
        children: [{ type: "text", value: title }],
      },
    ],
  };
}

/**
 * VersionGate 컴포넌트 처리
 * V1/V2 토글 상태에 따라 다른 컨텐츠를 표시하기 위한 컴포넌트
 */
export function handleVersionGateComponent(
  node: any,
  props: Record<string, any>,
): any {
  // 버전 정보 추출 (v 또는 version 속성 사용)
  const version = props.v || "";

  // 버전 정보가 없는 경우 기본 처리
  if (!version) {
    return {
      type: "root",
      children: node.children || [],
    };
  }

  // 주석 스타일 박스를 사용하여 버전 특화 콘텐츠 표시
  return {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: `<!-- VERSION-SPECIFIC: ${version.toUpperCase()} ONLY CONTENT START -->`,
          },
        ],
      },
      ...(node.children || []),
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: `<!-- VERSION-SPECIFIC: ${version.toUpperCase()} ONLY CONTENT END -->`,
          },
        ],
      },
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
    const item = nodesToRemove[i];
    if (item && item.parent && Array.isArray(item.parent.children)) {
      item.parent.children.splice(item.index, 1);
    }
  }
}
