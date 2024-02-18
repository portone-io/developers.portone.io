/* @jsxImportSource solid-js */

import { clsx } from "clsx";
import type { JSX } from "solid-js";

export function PaymentV1(
  props: Omit<JSX.IntrinsicElements["span"], "children">,
) {
  return (
    <span
      {...props}
      class={clsx(
        "bg-blue color-white inline-block rounded-sm px-1.5 text-sm font-bold",
        props.class,
      )}
    >
      결제 서비스 V1
    </span>
  );
}

export function PaymentV2(
  props: Omit<JSX.IntrinsicElements["span"], "children">,
) {
  return (
    <span
      {...props}
      class={clsx(
        "bg-orange color-white inline-block rounded-sm px-1.5 text-sm font-bold",
        props.class,
      )}
    >
      결제 서비스 V2
    </span>
  );
}

export function Recon(props: Omit<JSX.IntrinsicElements["span"], "children">) {
  return (
    <span
      {...props}
      class={clsx(
        "bg-red color-white inline-block rounded-sm px-1.5 text-sm font-bold",
        props.class,
      )}
    >
      정산통합조회 서비스
    </span>
  );
}

export function Partner(
  props: Omit<JSX.IntrinsicElements["span"], "children">,
) {
  return (
    <span
      {...props}
      class={clsx(
        "bg-purple color-white inline-block rounded-sm px-1.5 text-sm font-bold",
        props.class,
      )}
    >
      파트너정산 서비스
    </span>
  );
}
