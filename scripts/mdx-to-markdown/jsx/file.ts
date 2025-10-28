import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";

import { extractMdxJsxAttributes } from "./common.ts";

/**
 * File 컴포넌트 처리
 * @param node MDX JSX 노드
 * @returns 변환된 마크다운 노드
 */
export function handleFileComponent(
  node: MdxJsxFlowElement | MdxJsxTextElement,
) {
  // 속성 추출
  const props = extractMdxJsxAttributes(node);
  const captionInside =
    typeof props.captionInside === "string" ? props.captionInside : "";

  // 요구사항에 따라 변환: `(파일: ${captionInside})` 또는 "(파일 다운로드 링크)"
  return {
    type: "paragraph",
    children: [
      {
        type: "text",
        value: captionInside
          ? `(파일: ${captionInside})`
          : "(파일 다운로드 링크)",
      },
    ],
  };
}
