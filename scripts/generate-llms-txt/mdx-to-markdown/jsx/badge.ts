/**
 * Badge 컴포넌트 처리 (PaymentV1, PaymentV2, Recon, Console, Partner)
 * 각 뱃지를 볼드 텍스트로 변환
 */
export function handleBadgeComponent(componentName: string): any {
  // 컴포넌트 이름에 따라 적절한 텍스트 선택
  let badgeText = "";
  switch (componentName) {
    case "PaymentV1":
      badgeText = "결제 모듈 V1";
      break;
    case "PaymentV2":
      badgeText = "결제 모듈 V2";
      break;
    case "Recon":
      badgeText = "PG 거래대사";
      break;
    case "Console":
      badgeText = "관리자 콘솔";
      break;
    case "Partner":
      badgeText = "파트너 정산 자동화";
      break;
    default:
      badgeText = componentName;
  }

  // 볼드 텍스트로 변환
  return {
    type: "paragraph",
    children: [
      {
        type: "strong",
        children: [
          {
            type: "text",
            value: badgeText,
          },
        ],
      },
    ],
  };
}
