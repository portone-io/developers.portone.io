/**
 * Parameter 컴포넌트 처리
 */
export function handleParameterComponent(
  _node: any,
  _props: Record<string, any>,
): any {
  // Parameter 컴포넌트는 생략
  return {
    type: "root",
    children: [],
  };
}
