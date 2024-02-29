import type { HTMLAttributes } from "preact/compat";

export function PaymentV1({
  children: _,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-blue px-1.5 text-sm color-white font-bold"
    >
      결제 서비스 V1
    </span>
  );
}

export function PaymentV2({
  children: _,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-orange px-1.5 text-sm color-white font-bold"
    >
      결제 서비스 V2
    </span>
  );
}

export function Recon({
  children: _,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-red px-1.5 text-sm color-white font-bold"
    >
      정산통합조회 서비스
    </span>
  );
}

export function Partner({
  children: _,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      class="inline-block rounded-sm bg-purple px-1.5 text-sm color-white font-bold"
    >
      파트너정산 서비스
    </span>
  );
}
