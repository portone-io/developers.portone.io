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
import type { CodePreviewProps } from "~/components/interactive-docs/CodePreview";
import Picture from "~/components/Picture";
import { useInteractiveDocs } from "~/state/interactive-docs";

import type { Params } from "./type";

export function Preview(props: CodePreviewProps) {
  const { params: _params } = useInteractiveDocs();
  const params = _params as Params;

  const [paymentStatus, setPaymentStatus] = createSignal<{
    status: "IDLE" | "PENDING" | "PAID" | "FAILED";
  }>({ status: "IDLE" });
  const [payment, setPayment] = createSignal<
    PortOne.PaymentResponse | undefined
  >(undefined);

  // 재시도를 누르거나 파라미터가 변경될 때마다 초기화
  createEffect(() => {
    void trackStore(params);
    void props.renderId;

    void startTransition(() => {
      setPaymentStatus({ status: "IDLE" });
      setPayment(undefined);
    });
  });

  const requestPayment = async () => {
    if (paymentStatus().status === "PENDING") return undefined;
    const request = match(untrack(() => params))
      .with(
        { pg: { name: "toss", payMethods: "card" } },
        () =>
          ({
            storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
            paymentId: crypto.randomUUID(),
            orderName: "테스트 결제",
            totalAmount: 100,
            currency: "CURRENCY_KRW",
            channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
            payMethod: "CARD",
            card: {},
          }) satisfies PortOne.PaymentRequest,
      )
      .with(
        { pg: { name: "toss", payMethods: "virtualAccount" } },
        () =>
          ({
            storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
            paymentId: crypto.randomUUID(),
            orderName: "테스트 결제",
            totalAmount: 100,
            currency: "CURRENCY_KRW",
            channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
            payMethod: "VIRTUAL_ACCOUNT",
            virtualAccount: {
              accountExpiry: {
                validHours: 1,
              },
            },
          }) satisfies PortOne.PaymentRequest,
      )
      .with(
        { pg: { name: "nice", payMethods: "card" } },
        () =>
          ({
            storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
            paymentId: crypto.randomUUID(),
            orderName: "테스트 결제",
            totalAmount: 100,
            currency: "CURRENCY_KRW",
            channelKey: "channel-key-4ca6a942-3ee0-48fb-93ef-f4294b876d28",
            payMethod: "CARD",
            card: {},
            redirectUrl: "https://sdk-playground.portone.io/",
          }) satisfies PortOne.PaymentRequest,
      )
      .with(
        { pg: { name: "nice", payMethods: "virtualAccount" } },
        () =>
          ({
            storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
            paymentId: crypto.randomUUID(),
            orderName: "테스트 결제",
            totalAmount: 100,
            currency: "CURRENCY_KRW",
            channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
            payMethod: "VIRTUAL_ACCOUNT",
            virtualAccount: {
              accountExpiry: {
                validHours: 1,
              },
            },
            redirectUrl: "https://sdk-playground.portone.io/",
          }) satisfies PortOne.PaymentRequest,
      )
      .exhaustive();

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
        .with({ code: P.nullish }, () => {
          setPaymentStatus({ status: "PAID" });
        })
        .exhaustive(),
    ),
  );

  const Checkout = () => (
    <>
      <div class="flex items-center gap-6 rounded-lg bg-slate-50 p-3">
        <div class="flex rounded-md p-3">
          <Picture picture={dummyImg} alt="상품 이미지" class="w-16" />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-[17px] text-slate-6 font-medium leading-[30.6px]">
            나이키 멘즈 조이라이드 플라이니트
          </span>
          <span class="text-[18px] text-slate-6 font-medium leading-[27px]">
            1,000원
          </span>
        </div>
      </div>
      <button
        onClick={() => void requestPayment()}
        type="button"
        class="rounded-md bg-portone px-4 py-3"
      >
        <span class="text-[18px] text-white font-semibold leading-[27px]">
          결제
        </span>
      </button>
    </>
  );

  return (
    <div class="flex overflow-hidden rounded-lg bg-slate-1 p-10">
      <div class="flex flex-1 flex-col justify-between rounded-xl bg-white p-6">
        <Switch fallback={<Checkout />}>
          <Match when={paymentStatus().status === "PENDING"}>결제 중...</Match>
          <Match when={paymentStatus().status === "PAID"}>
            결제가 완료되었습니다.
          </Match>
          <Match when={paymentStatus().status === "FAILED"}>
            결제에 실패했습니다.
          </Match>
        </Switch>
      </div>
    </div>
  );
}
