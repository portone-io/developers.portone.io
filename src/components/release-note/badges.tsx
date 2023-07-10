export function PaymentV1({ children, ...props }: any) {
  return (
    <span
      {...props}
      class="bg-blue color-white inline-block rounded-sm px-1.5 text-sm font-bold"
    >
      결제 서비스 V1
    </span>
  );
}

export function PaymentV2({ children, ...props }: any) {
  return (
    <span
      {...props}
      class="bg-orange color-white inline-block rounded-sm px-1.5 text-sm font-bold"
    >
      결제 서비스 V2
    </span>
  );
}

export function Recon({ children, ...props }: any) {
  return (
    <span
      {...props}
      class="bg-red color-white inline-block rounded-sm px-1.5 text-sm font-bold"
    >
      정산통합조회 서비스
    </span>
  );
}

export function Partner({ children, ...props }: any) {
  return (
    <span
      {...props}
      class="bg-purple color-white inline-block rounded-sm px-1.5 text-sm font-bold"
    >
      파트너정산 서비스
    </span>
  );
}
