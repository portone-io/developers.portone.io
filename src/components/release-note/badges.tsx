import type { JSX } from "solid-js";

type Props = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children">;

export function PaymentV1(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-blue px-1.5 text-sm color-white font-bold"
    >
      결제 서비스 V1
    </span>
  );
}

export function PaymentV2(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-orange px-1.5 text-sm color-white font-bold"
    >
      결제 서비스 V2
    </span>
  );
}

export function Recon(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-red px-1.5 text-sm color-white font-bold"
    >
      정산통합조회 서비스
    </span>
  );
}

export function Partner(props: Props) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-purple px-1.5 text-sm color-white font-bold"
    >
      파트너정산 서비스
    </span>
  );
}
