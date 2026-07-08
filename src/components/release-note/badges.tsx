import type { JSX } from "solid-js";

type Props = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children">;

export function PaymentV1(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-xs bg-blue px-1.5 text-sm font-medium text-white"
    >
      결제 모듈 V1
    </span>
  );
}

export function PaymentV2(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-xs bg-orange px-1.5 text-sm font-medium text-white"
    >
      결제 모듈 V2
    </span>
  );
}

export function Recon(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-xs bg-red px-1.5 text-sm font-medium text-white"
    >
      PG 거래대사
    </span>
  );
}

export function Console(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-xs bg-yellow px-1.5 text-sm font-medium text-white"
    >
      관리자 콘솔
    </span>
  );
}

export function Partner(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-xs bg-purple px-1.5 text-sm font-medium text-white"
    >
      파트너 정산 자동화
    </span>
  );
}
