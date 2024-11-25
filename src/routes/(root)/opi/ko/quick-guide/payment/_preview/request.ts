import * as PortOne from "@portone/browser-sdk/v2";
import { match } from "ts-pattern";

import type { Params } from "./type";

const cardPayment = {
  payMethod: "CARD",
} satisfies Partial<PortOne.PaymentRequest>;

const virtualAccountPayment = {
  payMethod: "VIRTUAL_ACCOUNT",
  virtualAccount: {
    accountExpiry: {
      validHours: 1,
    },
  },
} satisfies Partial<PortOne.PaymentRequest>;

function templatedPayment(
  overrides: Partial<PortOne.PaymentRequest> &
    Pick<PortOne.PaymentRequest, "channelKey" | "payMethod" | "paymentId">,
): PortOne.PaymentRequest {
  return {
    storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
    orderName: "신발",
    totalAmount: 1000,
    currency: "CURRENCY_KRW",
    redirectUrl: "https://sdk-playground.portone.io/",
    ...overrides,
  } satisfies PortOne.PaymentRequest;
}

export function createPaymentRequest(params: Params, paymentId: string) {
  return match(params)
    .with({ pg: { name: "toss", payMethods: "card" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
        ...cardPayment,
      }),
    )
    .with({ pg: { name: "toss", payMethods: "virtualAccount" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
        ...virtualAccountPayment,
      }),
    )
    .with({ pg: { name: "nice", payMethods: "card" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-4ca6a942-3ee0-48fb-93ef-f4294b876d28",
        ...cardPayment,
      }),
    )
    .with({ pg: { name: "nice", payMethods: "virtualAccount" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
        ...virtualAccountPayment,
      }),
    )
    .with({ pg: { name: "smartro", payMethods: "card" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
        ...cardPayment,
        customer: {
          phoneNumber: "01012341234",
        },
      }),
    )
    .with({ pg: { name: "smartro", payMethods: "virtualAccount" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
        ...virtualAccountPayment,
        customer: {
          phoneNumber: "01012341234",
        },
      }),
    )
    .with({ pg: { name: "inicis", payMethods: "card" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
        ...cardPayment,
        customer: {
          fullName: "포트원",
          email: "example@portone.io",
          phoneNumber: "01012341234",
        },
      }),
    )
    .with({ pg: { name: "inicis", payMethods: "virtualAccount" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
        ...virtualAccountPayment,
        customer: {
          fullName: "포트원",
          email: "example@portone.io",
          phoneNumber: "01012341234",
        },
      }),
    )
    .with({ pg: { name: "kcp", payMethods: "card" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
        ...cardPayment,
      }),
    )
    .with({ pg: { name: "kcp", payMethods: "virtualAccount" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
        ...virtualAccountPayment,
      }),
    )
    .with({ pg: { name: "kpn", payMethods: "card" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
        ...cardPayment,
      }),
    )
    .with({ pg: { name: "kpn", payMethods: "virtualAccount" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
        ...virtualAccountPayment,
      }),
    )
    .with({ pg: { name: "ksnet", payMethods: "card" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
        ...cardPayment,
        customer: {
          fullName: "포트원",
        },
      }),
    )
    .with({ pg: { name: "ksnet", payMethods: "virtualAccount" } }, () =>
      templatedPayment({
        paymentId,
        channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
        ...virtualAccountPayment,
        customer: {
          fullName: "포트원",
        },
      }),
    )
    .exhaustive();
}
