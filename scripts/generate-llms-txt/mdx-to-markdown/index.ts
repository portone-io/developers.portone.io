import yaml from "js-yaml";
import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { type Frontmatter, type MdxParseResult } from "../mdx-parser";
import { transformJsxComponents } from "./jsx";

/**
 * MDX AST를 마크다운용 AST로 변환하는 함수
 * JSX 컴포넌트 변환, 임포트 구문 제거, YAML 노드 제거 등의 처리를 수행
 * @param slug 변환할 MDX 파일의 slug
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵 (slug -> MdxParseResult)
 * @returns 변환된 AST 노드
 * @throws Error parseResult를 찾을 수 없는 경우 예외 발생
 */
export function transformAstForMarkdown(
  slug: string,
  parseResultMap: Record<string, MdxParseResult>,
): Root {
  // slug에 해당하는 parseResult 가져오기
  const parseResult = parseResultMap[slug];

  // parseResult가 없으면 예외 발생
  if (!parseResult) {
    throw new Error(
      `[transformAstForMarkdown] parseResult not found for slug: ${slug}`,
    );
  }

  // AST 복제 (원본 변경 방지)
  const ast = JSON.parse(JSON.stringify(parseResult.ast));

  // JSX 컴포넌트를 마크다운으로 변환
  transformJsxComponents(ast, parseResultMap);

  // 임포트 구문 제거
  removeImports(ast);

  // YAML 노드 제거 (프론트매터는 별도로 처리)
  removeYamlNodes(ast);

  // JSX 요소 제거 또는 자식 노드만 유지
  simplifyJsxNodes(ast);

  // MDX 표현식 노드 처리
  handleRemainingMdxFlowExpressions(ast);

  return ast;
}

/**
 * 변환된 AST를 마크다운 문자열로 변환하는 함수
 * 프론트매터를 포함한 완전한 마크다운 문자열을 생성
 * remark 설정을 통해 GitHub Flavored Markdown 형식으로 출력
 * @param ast 변환된 AST 노드
 * @param frontmatter 프론트매터 객체 (선택적)
 * @returns 마크다운 문자열
 */
export function astToMarkdownString(
  ast: Root,
  frontmatter?: Frontmatter,
): string {
  // 프론트매터 문자열 생성
  let frontmatterStr = "";
  if (frontmatter && Object.keys(frontmatter).length > 0) {
    frontmatterStr = `---\n${yaml.dump(frontmatter)}---\n\n`;
  }

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

  const markdownContent = processor.stringify(ast);

  // 프론트매터와 마크다운 내용 결합
  return frontmatterStr + markdownContent;
}

/**
 * MDX 표현식 노드를 처리하는 함수
 */
function handleRemainingMdxFlowExpressions(ast: any): void {
  // MDX 플로우 표현식 처리
  visit(
    ast,
    "mdxFlowExpression",
    (node: any, index: number | undefined, parent: any) => {
      if (!parent || !Array.isArray(parent.children) || index === undefined)
        return;

      // 표현식을 텍스트 노드로 변환
      const newNode = {
        type: "text",
        value: node.value || "",
      };

      // 노드 교체
      parent.children.splice(index, 1, newNode);

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

  visit(ast, "yaml", (_node: any, index: number | undefined, parent: any) => {
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
 * 임포트 구문 제거
 */
function removeImports(ast: any): void {
  const nodesToRemove: Array<{ parent: any; index: number }> = [];

  visit(
    ast,
    "mdxjsEsm",
    (_node: any, index: number | undefined, parent: any) => {
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
