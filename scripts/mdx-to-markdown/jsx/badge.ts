import { match } from "ts-pattern";

/**
 * Badge 컴포넌트 처리 (PaymentV1, PaymentV2, Recon, Console, Partner)
 * 각 뱃지를 볼드 텍스트로 변환
 */
export function handleBadgeComponent(componentName: string) {
  // 컴포넌트 이름에 따라 적절한 텍스트 선택
  const badgeText = match(componentName)
    .with("PaymentV1", () => "결제 모듈 V1")
    .with("PaymentV2", () => "결제 모듈 V2")
    .with("Recon", () => "PG 거래대사")
    .with("Console", () => "관리자 콘솔")
    .with("Partner", () => "파트너 정산 자동화")
    .otherwise(() => componentName);

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
