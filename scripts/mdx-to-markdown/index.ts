import yaml from "js-yaml";
import type { Root, Text } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import stringWidth from "string-width";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { transformJsxComponents } from "./jsx";
import { type Frontmatter, type MdxParseResult } from "./mdx-parser";

/**
 * MDX AST를 마크다운용 AST로 변환하는 함수
 * JSX 컴포넌트 변환, 임포트 구문 제거, YAML 노드 제거 등의 처리를 수행
 * @param slug 변환할 MDX 파일의 slug
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵 (slug -> MdxParseResult)
 * @param useMarkdownLinks 내부 링크를 마크다운 파일 링크로 변환할지 여부 (true: 마크다운 파일 링크, false: 웹페이지 링크)
 * @returns 변환된 AST 노드
 * @throws Error parseResult를 찾을 수 없는 경우 예외 발생
 */
export function transformAstForMarkdown(
  slug: string,
  parseResultMap: Record<string, MdxParseResult>,
  useMarkdownLinks: boolean = true,
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
  const ast = structuredClone(parseResult.ast);

  // 기존 마크다운 형식 링크 변환
  transformLinks(ast, useMarkdownLinks);

  // JSX 컴포넌트를 마크다운으로 변환 (useMarkdownLinks 파라미터 전달)
  transformJsxComponents(ast, parseResultMap, useMarkdownLinks);

  // 임포트 구문 제거
  removeImports(ast);

  // YAML 노드 제거 (프론트매터는 별도로 처리)
  removeYamlNodes(ast);

  // JSX 요소 제거 또는 자식 노드만 유지
  simplifyJsxElements(ast);

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
    // thumbnail 필드를 제외한 프론트매터 생성
    const { thumbnail: _thumbnail, ...filteredFrontmatter } = frontmatter;
    frontmatterStr = `---\n${yaml.dump(filteredFrontmatter)}---\n\n`;
  }

  // 마크다운으로 변환
  const processor = unified()
    .use(remarkGfm, { tableCellPadding: false, stringLength: stringWidth }) // GitHub Flavored Markdown 지원 (테이블 등)
    .use(remarkStringify, {
      bullet: "-",
      emphasis: "_",
      listItemIndent: "one",
      rule: "-",
    }); // 타입 오류 해결을 위한 any 타입 캐스팅

  const markdownContent = processor.stringify(ast);

  // 프론트매터와 마크다운 내용 결합
  return frontmatterStr + markdownContent;
}

/**
 * 미리 존재하는 마크다운 링크를 알맞게 변환합니다.
 *
 * @param ast 변환할 AST
 * @param [useMarkdownLinks=true] true이면 마크다운 경로로, false이면 웹페이지 경로로 변환합니다.
 */
function transformLinks(ast: Root, useMarkdownLinks: boolean = true): void {
  const BASE_URL = "https://developers.portone.io";

  // 링크 노드를 찾아 변환
  visit(ast, "link", (node) => {
    const url = node.url;

    // 이미 hostname이 있는 외부 링크는 변환하지 않음
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return;
    }

    // 내부 링크인 경우 (슬래시로 시작하는 경우)
    if (url.startsWith("/")) {
      // URL 파싱 (쿼리 파라미터와 해시 프래그먼트 처리)
      const urlParts = url.split(/[?#]/);
      const path = urlParts[0]!;
      const queryAndHash = url.substring(path.length);

      // 기본 URL에 경로 추가
      let newUrl = `${BASE_URL}${path}`;

      // useMarkdownLinks가 true이면 .md 확장자 추가
      if (useMarkdownLinks) {
        newUrl += ".md";
      }

      // 쿼리 파라미터와 해시 프래그먼트 다시 추가
      newUrl += queryAndHash;

      // 노드 URL 업데이트
      node.url = newUrl;
    }
  });
}

/**
 * MDX 표현식 노드를 처리하는 함수
 */
function handleRemainingMdxFlowExpressions(ast: Root): void {
  // MDX 플로우 표현식 처리
  visit(ast, "mdxFlowExpression", (node, index, parent) => {
    if (!parent || !Array.isArray(parent.children) || index === undefined)
      return;

    // 표현식을 텍스트 노드로 변환
    const newNode: Text = {
      type: "text",
      value: node.value || "",
    };

    // 노드 교체
    parent.children.splice(index, 1, newNode);

    // 방문 인덱스 조정
    return index;
  });
}

/**
 * YAML 노드 제거 함수
 */
function removeYamlNodes(ast: Root): void {
  const nodesToRemove: Array<{ parent: Root; index: number }> = [];

  visit(ast, "yaml", (_node, index, parent) => {
    if (index !== undefined && parent) {
      nodesToRemove.push({ parent, index });
    }
  });

  // 역순으로 제거
  for (const item of [...nodesToRemove].reverse()) {
    item.parent.children.splice(item.index, 1);
  }
}

/**
 * JSX 노드를 단순화하는 함수 (자식 노드만 유지)
 */
function simplifyJsxElements(ast: Root): void {
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (_node, index, parent) => {
      const node = _node as MdxJsxFlowElement | MdxJsxTextElement;
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
 * 임포트 구문 제거
 */
function removeImports(ast: Root): void {
  const nodesToRemove: Array<{ parent: Root; index: number }> = [];

  visit(ast, "mdxjsEsm", (_node, index, parent) => {
    if (index !== undefined && parent) {
      nodesToRemove.push({ parent, index });
    }
  });

  // 역순으로 제거
  for (const item of [...nodesToRemove].reverse()) {
    item.parent.children.splice(item.index, 1);
  }
}
