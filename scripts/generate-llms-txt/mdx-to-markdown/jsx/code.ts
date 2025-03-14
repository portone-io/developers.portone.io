/**
 * 코드 컴포넌트의 내용을 추출하여 백틱으로 감싼 텍스트 노드를 생성하는 함수
 * @param node 코드 컴포넌트 노드
 * @returns 백틱으로 감싼 텍스트 노드
 */
export function extractCodeContent(node: any): any {
  // 자식 노드의 텍스트 추출
  let codeContent = "";
  if (node.children && node.children.length > 0) {
    // 모든 자식 텍스트 노드의 내용 결합
    node.children.forEach((child: any) => {
      codeContent += child.value;
    });
  }

  // 백틱으로 감싼 텍스트 노드 생성
  return {
    type: "inlineCode",
    value: codeContent,
  };
}
