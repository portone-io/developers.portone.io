/**
 * Youtube 컴포넌트 처리
 * @param node MDX JSX 노드
 * @param props 컴포넌트 속성
 * @returns 변환된 마크다운 노드
 */
export function handleYoutubeComponent(
  node: any,
  props: Record<string, any>,
): any {
  // videoId와 caption 추출
  const videoId = props.videoId || "";
  const caption = props.caption || "YouTube 비디오";

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // 단순히 caption을 제목으로 하는 링크 생성
  return {
    type: "paragraph",
    children: [
      {
        type: "link",
        url,
        children: [{ type: "text", value: caption }],
      },
    ],
  };
}
