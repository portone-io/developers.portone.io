/**
 * ApiLink 컴포넌트를 마크다운으로 변환하는 함수
 *
 * @param node ApiLink 컴포넌트 노드
 * @returns 마크다운 노드
 */
export function handleApiLinkComponent(props: Record<string, unknown>) {
  // 필수 속성 확인
  const {
    basepath: basepathStr,
    method: methodStr,
    path: pathStr,
    apiName: apiNameStr,
  } = props;

  const basepath = typeof basepathStr === "string" ? basepathStr : undefined;
  const method = typeof methodStr === "string" ? methodStr : undefined;
  const path = typeof pathStr === "string" ? pathStr : undefined;
  const apiName = typeof apiNameStr === "string" ? apiNameStr : undefined;

  if (!method || !path || !basepath) {
    return {
      type: "text",
      value: "[API Link]",
    };
  }

  // API 메서드에 따른 스타일 적용 (마크다운에서는 굵게 표시)
  const methodFormatted = method.toUpperCase();

  // basePath에 따라 참조할 OpenAPI 스키마 파일 결정
  let schemaFile = "";
  if (basepath.includes("rest-v1")) {
    schemaFile = "v1.openapi.yml";
  } else if (basepath.includes("rest-v2")) {
    schemaFile = "v2.openapi.yml";
  }

  // API 참조 URL 생성
  const schemaUrl = `https://developers.portone.io/schema/${schemaFile}`;

  // 링크 텍스트 생성
  const linkText = apiName
    ? `${apiName} - ${methodFormatted} ${path}`
    : `${methodFormatted} ${path}`;

  // mdast에 맞는 마크다운 링크를 children으로 가지는 paragraph 생성
  return {
    type: "paragraph",
    children: [
      {
        type: "link",
        url: schemaUrl,
        children: [
          {
            type: "text",
            value: linkText,
          },
        ],
      },
    ],
  };
}
