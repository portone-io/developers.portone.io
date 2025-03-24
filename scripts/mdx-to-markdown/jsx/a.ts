import type { Html, Root } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node } from "unist";

import { extractMdxJsxAttributes } from "./common";

/**
 * A 컴포넌트를 HTML <a> 태그로 변환하는 함수
 *
 * @param node 변환할 MDX JSX 노드
 * @param transformRecursively 자식 노드들을 재귀적으로 변환하는 함수
 * @returns 변환된 HTML 노드
 */
export function handleAComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  transformRecursively: (innerAst: Node) => {
    ast: Node;
    unhandledTags: Set<string>;
  },
): { ast: Node; unhandledTags: Set<string> } {
  // 속성 추출
  const attrs = extractMdxJsxAttributes(node);
  const { href: wrappedHref, ...otherAttrs } = attrs;
  const href =
    typeof wrappedHref === "string"
      ? wrappedHref.replace(/^`|`$/g, "")
      : wrappedHref;

  // href 처리 - 호스트명 추가
  let processedHref = href;
  if (typeof href === "string") {
    // 외부 링크 체크 (http://, https://, mailto:, tel: 등으로 시작하는지)
    if (
      !href.match(/^(https?:\/\/|mailto:|tel:|ftp:|\/\/)/i) &&
      !href.startsWith("/")
    ) {
      // 상대 경로이고 호스트명이 없는 경우 추가
      processedHref = `/${href}`;
    }

    // 절대 경로인데 호스트명이 없으면 추가
    if (href.startsWith("/") && !href.includes("developers.portone.io")) {
      processedHref = `https://developers.portone.io${href}`;
    }
  }

  // 수정된 속성으로 속성 문자열 생성
  const allAttrs = { ...otherAttrs, href: processedHref };
  const attrsString = Object.entries(allAttrs)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }
      return `${key}="${String(value).replace(/"/g, "&quot;")}"`;
    })
    .join(" ");

  // 속성이 있는 경우 공백 추가
  const attrsPart = attrsString ? ` ${attrsString}` : "";

  // 자식 노드가 있는지 확인
  const hasChildren = node.children.length > 0;

  // 자식 노드가 없는 경우 self-closing 태그 반환
  if (!hasChildren) {
    return {
      ast: {
        type: "html",
        value: `<a${attrsPart} />`,
      } satisfies Html as Html,
      unhandledTags: new Set<string>(),
    };
  }

  // 자식 노드 재귀적으로 변환
  const results = node.children.map(transformRecursively);
  const newChildren = results.map((r) => r.ast);
  const unhandledTags = results.reduce(
    (acc, r) => acc.union(r.unhandledTags),
    new Set<string>(),
  );

  // 열고 닫는 태그와 그 사이에 자식 노드 배치
  return {
    ast: {
      type: "root",
      children: [
        {
          type: "html",
          value: `<a${attrsPart}>`,
        },
        ...newChildren,
        {
          type: "html",
          value: `</a>`,
        },
      ],
    } as Root,
    unhandledTags,
  };
}
