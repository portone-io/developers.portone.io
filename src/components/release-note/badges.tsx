import type { JSX } from "solid-js";

type Props = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children">;

export function PaymentV1(props: Props) {
  return (
    <span
      {...props}
      class="bg-blue color-white inline-block rounded-sm px-1.5 text-sm font-medium"
    >
      결제 모듈 V1
    </span>
  );
}

export function PaymentV2(props: Props) {
  return (
    <span
      {...props}
      class="bg-orange color-white inline-block rounded-sm px-1.5 text-sm font-medium"
    >
      결제 모듈 V2
    </span>
  );
}

export function Recon(props: Props) {
  return (
    <span
      {...props}
      class="bg-red color-white inline-block rounded-sm px-1.5 text-sm font-medium"
    >
      PG 거래대사
    </span>
  );
}

export function Console(props: Props) {
  return (
    <span
      {...props}
      class="bg-yellow color-white inline-block rounded-sm px-1.5 text-sm font-medium"
    >
      관리자 콘솔
    </span>
  );
}

export function Partner(props: Props) {
  return (
    <span
      {...props}
      class="bg-purple color-white inline-block rounded-sm px-1.5 text-sm font-medium"
    >
      파트너 정산 자동화
    </span>
  );
}
