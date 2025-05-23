import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

import type { MdxParseResult } from "../mdx-parser";
import { extractMdxJsxAttributes } from "./common";

/**
 * ContentRef 컴포넌트 처리
 * @param node JSX 컴포넌트 노드
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵
 * @param useMarkdownLinks 내부 링크를 마크다운 파일 링크로 변환할지 여부 (true: 마크다운 파일 링크, false: 웹페이지 링크)
 * @returns 변환된 마크다운 노드
 */
export function handleContentRefComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  parseResultMap: Record<string, MdxParseResult>,
  useMarkdownLinks: boolean = true,
) {
  const props = extractMdxJsxAttributes(node);
  const slugProp = props.slug;
  const slug = typeof slugProp === "string" ? slugProp.replace(/^\//, "") : "";
  let title;

  // slug에 해당하는 문서가 있으면 해당 문서의 frontmatter title 사용
  if (slug && parseResultMap[slug]) {
    const targetDoc = parseResultMap[slug];
    title = targetDoc?.frontmatter.title;
  }

  // title이 여전히 없는 경우
  if (!title) {
    title = "링크";
  }

  // 마크다운 링크로 변환 (useMarkdownLinks에 따라 URL 형식 결정)
  const url = useMarkdownLinks
    ? `https://developers.portone.io/${slug}.md`
    : `https://developers.portone.io/${slug}`;

  return {
    type: "paragraph",
    children: [
      {
        type: "link",
        url,
        children: [{ type: "text", value: title }],
      },
    ],
  };
}
