/**
 * Swagger 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param props 컴포넌트 속성
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerComponent(
  node: any,
  props: Record<string, any>,
): any {
  // 헤더 생성 (메서드 + 경로)
  const headerNode = {
    type: "paragraph",
    children: [
      {
        type: "strong",
        children: [
          {
            type: "text",
            value: props.method.toUpperCase(),
          },
        ],
      },
      {
        type: "text",
        value: ` ${props.baseUrl}${props.path}`,
      },
    ],
  };

  // 요약 정보
  const summaryNode = props.summary
    ? {
        type: "paragraph",
        children: [
          {
            type: "emphasis",
            children: [{ type: "text", value: props.summary }],
          },
        ],
      }
    : undefined;

  // 자식 노드들을 포함한 컨테이너 생성
  return {
    type: "root",
    children: [
      headerNode,
      ...(summaryNode ? [summaryNode] : []),
      ...(node.children || []),
    ],
  };
}

/**
 * SwaggerDescription 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param _props 컴포넌트 속성
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerDescriptionComponent(
  node: any,
  _props: Record<string, any>,
): any {
  // 자식 노드들을 포함한 컨테이너 생성
  return {
    type: "root",
    children: node.children,
  };
}

/**
 * SwaggerResponse 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param props 컴포넌트 속성
 * @returns 변환된 마크다운 노드
 */
export function handleSwaggerResponseComponent(
  node: any,
  props: Record<string, any>,
): any {
  // 헤더 노드 생성
  const headerNode = {
    type: "paragraph",
    children: [
      {
        type: "strong",
        children: [{ type: "text", value: props.status }],
      },
      {
        type: "text",
        value: ` - ${props.description}`,
      },
    ],
  };

  // 최종 노드 구성
  return {
    type: "root",
    children: [headerNode, ...(node.children || [])],
  };
}
