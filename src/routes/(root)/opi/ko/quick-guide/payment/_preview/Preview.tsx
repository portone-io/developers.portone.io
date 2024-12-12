import * as PortOne from "@portone/browser-sdk/v2";
import { trackStore } from "@solid-primitives/deep";
import {
  createEffect,
  createSignal,
  Match,
  on,
  startTransition,
  Switch,
  untrack,
} from "solid-js";
import { match, P } from "ts-pattern";

import dummyImg from "~/assets/dummy/5653e4f30f22b1afcadaa75ca5873e2f.png";
import Picture from "~/components/Picture";
import { useInteractiveDocs } from "~/state/interactive-docs";

import { createPaymentRequest } from "./request";
import type { Params } from "./type";

export function Preview() {
  const { params: _params } = useInteractiveDocs();
  const params = _params as Params;

  const [paymentStatus, setPaymentStatus] = createSignal<{
    status: "IDLE" | "PENDING" | "PAID" | "FAILED";
  }>({ status: "IDLE" });
  const [payment, setPayment] = createSignal<
    PortOne.PaymentResponse | undefined
  >(undefined);

  const reload = () => {
    void startTransition(() => {
      setPaymentStatus({ status: "IDLE" });
      setPayment(undefined);
    });
  };

  // 파라미터가 변경될 때마다 초기화
  createEffect(on(() => trackStore(params), reload));

  const requestPayment = async () => {
    if (paymentStatus().status === "PENDING") return undefined;
    const paymentId = crypto
      .getRandomValues(new Uint32Array(1))[0]!
      .toString(16)
      .padStart(8, "0");

    const request = createPaymentRequest(
      untrack(() => params),
      paymentId,
    );

    setPaymentStatus({ status: "PENDING" });
    setPayment(await PortOne.requestPayment(request));
  };
  createEffect(
    on(payment, (payment) =>
      match(payment)
        .with(P.nullish, () => {})
        .with({ code: P.nonNullable }, () => {
          setPaymentStatus({ status: "FAILED" });
        })
        .with(P.not({ code: P.nonNullable }), () => {
          setPaymentStatus({ status: "PAID" });
        })
        .exhaustive(),
    ),
  );

  const Checkout = () => (
    <>
      <div class="h-20 w-20 flex rounded-md bg-slate-1 p-3">
        <Picture picture={dummyImg} alt="상품 이미지" />
      </div>
      <div class="flex flex-col">
        <span class="text-[17px] text-slate-6 font-medium leading-[30.6px]">
          신발
        </span>
        <span class="text-[18px] text-slate-6 font-medium leading-[27px]">
          1,000원
        </span>
      </div>
    </>
  );

  return (
    <div class="flex flex-col gap-2 rounded-b-lg bg-slate-1 p-2">
      <div class="flex items-center gap-3 rounded-lg bg-slate-50">
        <Switch fallback={<Checkout />}>
          <Match when={paymentStatus().status === "PENDING"}>결제 중...</Match>
          <Match when={paymentStatus().status === "PAID"}>
            <div class="h-12 w-12 flex items-center justify-center rounded-full bg-green-5">
              <i class="i-mdi-check-bold text-2xl text-white" />
            </div>
            <span class="text-lg font-semibold">결제가 완료되었습니다.</span>
          </Match>
          <Match when={paymentStatus().status === "FAILED"}>
            <div class="h-12 w-12 flex items-center justify-center rounded-full bg-red-5">
              <i class="i-mdi-close-bold text-2xl text-white" />
            </div>
            <span class="text-lg font-semibold">결제에 실패했습니다.</span>
          </Match>
        </Switch>
      </div>
      <div class="grid grid-cols-[1fr_auto] gap-2">
        <button
          onClick={() => void requestPayment()}
          type="button"
          class="flex justify-center rounded-md bg-portone px-4 py-2"
        >
          <span class="text-[15px] text-white font-medium leading-5.5">
            결제
          </span>
        </button>
        <button
          onClick={() => void reload()}
          type="button"
          class="flex items-center justify-center gap-1 rounded-md bg-slate-3 px-4 py-2"
        >
          <i class="i-mdi-reload" />
          <span class="text-[15px] text-[#1F2937] font-medium leading-5.5">
            새로고침
          </span>
        </button>
      </div>
    </div>
  );
}
