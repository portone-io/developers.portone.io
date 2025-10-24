import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

import { extractMdxJsxAttributes } from "./common.ts";

/**
 * Figure 컴포넌트 처리
 */
export function handleFigureComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
) {
  // 이미지 캡션 추출
  const props = extractMdxJsxAttributes(node);
  const caption = typeof props.caption === "string" ? props.caption : "";

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
