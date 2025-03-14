import type { MdxParseResult } from "scripts/generate-llms-txt/mdx-parser";

/**
 * ConentRef 컴포넌트 처리
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

  // title이 여전히 없는 경우
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
