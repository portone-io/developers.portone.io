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

  // 재시도를 누르거나 파라미터가 변경될 때마다 초기화
  createEffect(() => {
    void trackStore(params);

    void reload();
  });

  const requestPayment = async () => {
    if (paymentStatus().status === "PENDING") return undefined;
    const paymentId = crypto
      .getRandomValues(new Uint32Array(1))[0]!
      .toString(16)
      .padStart(8, "0");

    const createPayment: (
      overrides: Partial<PortOne.PaymentRequest> &
        Pick<PortOne.PaymentRequest, "channelKey" | "payMethod">,
    ) => PortOne.PaymentRequest = (overrides) => {
      return {
        paymentId,
        storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
        orderName: "신발",
        totalAmount: 1000,
        currency: "CURRENCY_KRW",
        redirectUrl: "https://sdk-playground.portone.io/",
        ...overrides,
      } satisfies PortOne.PaymentRequest;
    };

    const request = match(untrack(() => params))
      .with({ pg: { name: "toss", payMethods: "card" } }, () =>
        createPayment({
          channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
          payMethod: "CARD",
        }),
      )
      .with({ pg: { name: "toss", payMethods: "virtualAccount" } }, () =>
        createPayment({
          channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
          payMethod: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            accountExpiry: {
              validHours: 1,
            },
          },
        }),
      )
      .with({ pg: { name: "nice", payMethods: "card" } }, () =>
        createPayment({
          channelKey: "channel-key-4ca6a942-3ee0-48fb-93ef-f4294b876d28",
          payMethod: "CARD",
        }),
      )
      .with({ pg: { name: "nice", payMethods: "virtualAccount" } }, () =>
        createPayment({
          channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
          payMethod: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            accountExpiry: {
              validHours: 1,
            },
          },
        }),
      )
      .with({ pg: { name: "smartro", payMethods: "card" } }, () =>
        createPayment({
          channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
          payMethod: "CARD",
          customer: {
            phoneNumber: "01012341234",
          },
        }),
      )
      .with({ pg: { name: "smartro", payMethods: "virtualAccount" } }, () =>
        createPayment({
          channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
          payMethod: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            accountExpiry: {
              validHours: 1,
            },
          },
          customer: {
            phoneNumber: "01012341234",
          },
        }),
      )
      .with({ pg: { name: "inicis", payMethods: "card" } }, () =>
        createPayment({
          channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
          payMethod: "CARD",
          customer: {
            fullName: "포트원",
            email: "example@portone.io",
            phoneNumber: "01012341234",
          },
        }),
      )
      .with({ pg: { name: "inicis", payMethods: "virtualAccount" } }, () =>
        createPayment({
          channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
          payMethod: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            accountExpiry: {
              validHours: 1,
            },
          },
          customer: {
            fullName: "포트원",
            email: "example@portone.io",
            phoneNumber: "01012341234",
          },
        }),
      )
      .with({ pg: { name: "kcp", payMethods: "card" } }, () =>
        createPayment({
          channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
          payMethod: "CARD",
        }),
      )
      .with({ pg: { name: "kcp", payMethods: "virtualAccount" } }, () =>
        createPayment({
          channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
          payMethod: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            accountExpiry: {
              validHours: 1,
            },
          },
        }),
      )
      .with({ pg: { name: "kpn", payMethods: "card" } }, () =>
        createPayment({
          channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
          payMethod: "CARD",
        }),
      )
      .with({ pg: { name: "kpn", payMethods: "virtualAccount" } }, () =>
        createPayment({
          channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
          payMethod: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            accountExpiry: {
              validHours: 1,
            },
          },
        }),
      )
      .with({ pg: { name: "ksnet", payMethods: "card" } }, () =>
        createPayment({
          channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
          payMethod: "CARD",
          customer: {
            fullName: "포트원",
          },
        }),
      )
      .with({ pg: { name: "ksnet", payMethods: "virtualAccount" } }, () =>
        createPayment({
          channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
          payMethod: "VIRTUAL_ACCOUNT",
          virtualAccount: {
            accountExpiry: {
              validHours: 1,
            },
          },
          customer: {
            fullName: "포트원",
          },
        }),
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
        .with(P.not({ code: P.nonNullable }), () => {
          setPaymentStatus({ status: "PAID" });
        })
        .exhaustive(),
    ),
  );

  const Checkout = () => (
    <>
      <div class="h-20 w-20 flex rounded-md rounded-md bg-slate-1 p-3">
        <Picture picture={dummyImg} alt="상품 이미지" />
      </div>
      <div class="flex flex-col">
        <span class="text-[17px] text-slate-6 font-medium leading-[30.6px]">
          나이키 멘즈 조이라이드 플라이니트
        </span>
        <span class="text-[18px] text-slate-6 font-medium leading-[27px]">
          1,000원
        </span>
      </div>
    </>
  );

  return (
    <div class="flex flex-col gap-2 rounded-lg bg-slate-1 p-2">
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
