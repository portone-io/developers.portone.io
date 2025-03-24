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

const easyPayPaymentKakaoPay = {
  payMethod: "EASY_PAY",
  easyPay: {
    easyPayProvider: "EASY_PAY_PROVIDER_KAKAOPAY",
  },
} satisfies Partial<PortOne.PaymentRequest>;

const easyPayPaymentEmpty = {
  payMethod: "EASY_PAY",
} satisfies Partial<PortOne.PaymentRequest>;

const easyPayPaymentNaverPay = {
  payMethod: "EASY_PAY",
  easyPay: {
    easyPayProvider: "EASY_PAY_PROVIDER_NAVERPAY",
  },
} satisfies Partial<PortOne.PaymentRequest>;

const customer = {
  fullName: "포트원",
  email: "example@portone.io",
  phoneNumber: "01012341234",
} satisfies PortOne.Entity.Customer;

const overrides = {
  toss: {
    card: {
      channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
      ...cardPayment,
    },
    virtualAccount: {
      channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
      ...virtualAccountPayment,
    },
    easyPay: {
      channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
      ...easyPayPaymentKakaoPay,
    },
  },
  nice: {
    card: {
      channelKey: "channel-key-4ca6a942-3ee0-48fb-93ef-f4294b876d28",
      ...cardPayment,
    },
    virtualAccount: {
      channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
      ...virtualAccountPayment,
    },
    easyPay: {
      channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
      ...easyPayPaymentKakaoPay,
    },
  },
  smartro: {
    card: {
      channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
      ...cardPayment,
      customer: {
        phoneNumber: customer.phoneNumber,
      },
    },
    virtualAccount: {
      channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
      ...virtualAccountPayment,
      customer: {
        phoneNumber: customer.phoneNumber,
      },
    },
    easyPay: {
      channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
      ...easyPayPaymentKakaoPay,
    },
  },
  inicis: {
    card: {
      channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
      ...cardPayment,
      customer,
    },
    virtualAccount: {
      channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
      ...virtualAccountPayment,
      customer,
    },
    easyPay: {
      channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
      ...easyPayPaymentKakaoPay,
      customer,
    },
  },
  kcp: {
    card: {
      channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
      ...cardPayment,
    },
    virtualAccount: {
      channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
      ...virtualAccountPayment,
    },
    easyPay: {
      channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
      ...easyPayPaymentKakaoPay,
    },
  },
  kpn: {
    card: {
      channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
      ...cardPayment,
    },
    virtualAccount: {
      channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
      ...virtualAccountPayment,
    },
    easyPay: {
      channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
      ...easyPayPaymentEmpty,
    },
  },
  ksnet: {
    card: {
      channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
      ...cardPayment,
      customer: {
        fullName: customer.fullName,
      },
    },
    virtualAccount: {
      channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
      ...virtualAccountPayment,
      customer: {
        fullName: customer.fullName,
      },
    },
    easyPay: {
      channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
      ...easyPayPaymentNaverPay,
      customer: {
        fullName: customer.fullName,
      },
      productType: "PRODUCT_TYPE_REAL",
      bypass: {
        ksnet: {
          easyPayDirect: true,
        },
      },
    },
  },
  kakao: {
    easyPay: {
      payMethod: "EASY_PAY",
      channelKey: "channel-key-01764171-b249-4c16-9d18-e9174fa8e611",
    },
  },
  naver: {
    easyPay: {
      payMethod: "EASY_PAY",
    },
  },
  tosspay: {
    easyPay: {
      payMethod: "EASY_PAY",
      channelKey: "channel-key-1d494380-d047-458a-a20a-edd28f7f635c",
    },
  },
} as const;

function templatedPayment(
  paymentId: string,
  overrides: Partial<PortOne.PaymentRequest> &
    Pick<PortOne.PaymentRequest, "channelKey" | "payMethod">,
): PortOne.PaymentRequest {
  return {
    paymentId,
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
      templatedPayment(paymentId, overrides.toss.card),
    )
    .with({ pg: { name: "toss", payMethods: "virtualAccount" } }, () =>
      templatedPayment(paymentId, overrides.toss.virtualAccount),
    )
    .with({ pg: { name: "toss", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.toss.easyPay),
    )
    .with({ pg: { name: "nice", payMethods: "card" } }, () =>
      templatedPayment(paymentId, overrides.nice.card),
    )
    .with({ pg: { name: "nice", payMethods: "virtualAccount" } }, () =>
      templatedPayment(paymentId, overrides.nice.virtualAccount),
    )
    .with({ pg: { name: "nice", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.nice.easyPay),
    )
    .with({ pg: { name: "smartro", payMethods: "card" } }, () =>
      templatedPayment(paymentId, overrides.smartro.card),
    )
    .with({ pg: { name: "smartro", payMethods: "virtualAccount" } }, () =>
      templatedPayment(paymentId, overrides.smartro.virtualAccount),
    )
    .with({ pg: { name: "smartro", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.smartro.easyPay),
    )
    .with({ pg: { name: "inicis", payMethods: "card" } }, () =>
      templatedPayment(paymentId, overrides.inicis.card),
    )
    .with({ pg: { name: "inicis", payMethods: "virtualAccount" } }, () =>
      templatedPayment(paymentId, overrides.inicis.virtualAccount),
    )
    .with({ pg: { name: "inicis", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.inicis.easyPay),
    )
    .with({ pg: { name: "kcp", payMethods: "card" } }, () =>
      templatedPayment(paymentId, overrides.kcp.card),
    )
    .with({ pg: { name: "kcp", payMethods: "virtualAccount" } }, () =>
      templatedPayment(paymentId, overrides.kcp.virtualAccount),
    )
    .with({ pg: { name: "kcp", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.kcp.easyPay),
    )
    .with({ pg: { name: "kpn", payMethods: "card" } }, () =>
      templatedPayment(paymentId, overrides.kpn.card),
    )
    .with({ pg: { name: "kpn", payMethods: "virtualAccount" } }, () =>
      templatedPayment(paymentId, overrides.kpn.virtualAccount),
    )
    .with({ pg: { name: "kpn", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.kpn.easyPay),
    )
    .with({ pg: { name: "ksnet", payMethods: "card" } }, () =>
      templatedPayment(paymentId, overrides.ksnet.card),
    )
    .with({ pg: { name: "ksnet", payMethods: "virtualAccount" } }, () =>
      templatedPayment(paymentId, overrides.ksnet.virtualAccount),
    )
    .with({ pg: { name: "ksnet", payMethods: "easyPay" } }, () =>
      // easyPayBypass 파라미터 누락
      // @ts-expect-error(2345)
      templatedPayment(paymentId, overrides.ksnet.easyPay),
    )
    .with({ pg: { name: "kakao", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.kakao.easyPay),
    )
    .with({ pg: { name: "naver", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.naver.easyPay),
    )
    .with({ pg: { name: "tosspay", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.tosspay.easyPay),
    )
    .exhaustive();
}
