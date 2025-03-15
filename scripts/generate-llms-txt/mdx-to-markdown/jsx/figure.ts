/**
 * Figure 컴포넌트 처리
 */
export function handleFigureComponent(props: Record<string, any>): any {
  // 이미지 캡션 추출
  const caption = props.caption || "";

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
