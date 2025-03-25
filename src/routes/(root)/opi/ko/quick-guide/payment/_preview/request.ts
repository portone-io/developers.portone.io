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

const transferPayment = {
  payMethod: "TRANSFER",
} satisfies Partial<PortOne.PaymentRequest>;

const mobilePayment = {
  payMethod: "MOBILE",
  productType: "PRODUCT_TYPE_DIGITAL",
} satisfies Partial<PortOne.PaymentRequest>;

const giftCertificatePayment = {
  payMethod: "GIFT_CERTIFICATE",
} satisfies Partial<PortOne.PaymentRequest>;

const giftCertificatePaymentCultureland = {
  payMethod: "GIFT_CERTIFICATE",
  giftCertificate: {
    giftCertificateType: "GIFT_CERTIFICATE_TYPE_CULTURELAND",
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
    transfer: {
      channelKey: "channel-key-ebe7daa6-4fe4-41bd-b17d-3495264399b5",
      ...transferPayment,
    },
    mobile: {
      ...mobilePayment,
    },
    giftCertificate: {
      ...giftCertificatePaymentCultureland,
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
    transfer: {
      channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
      ...transferPayment,
    },
    mobile: {
      channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
      ...mobilePayment,
    },
    giftCertificate: {
      channelKey: "channel-key-e6c31df1-5559-4b4a-9b2c-a35793d14db2",
      ...giftCertificatePaymentCultureland,
      bypass: {
        nice_v2: {
          MallUserID: "MallUserID",
        },
      },
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
    transfer: {
      channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
      ...transferPayment,
      customer: {
        phoneNumber: customer.phoneNumber,
      },
    },
    mobile: {
      channelKey: "channel-key-c4a4b281-a1e5-40c9-8140-f055262bcefd",
      ...mobilePayment,
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
    transfer: {
      channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
      ...transferPayment,
      customer,
    },
    mobile: {
      channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
      ...mobilePayment,
      customer,
    },
    giftCertificate: {
      channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
      ...giftCertificatePayment,
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
    transfer: {
      channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
      ...transferPayment,
    },
    mobile: {
      channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
      ...mobilePayment,
    },
    giftCertificate: {
      channelKey: "channel-key-a79920e0-a898-49f0-aab7-50aa6834848f",
      ...giftCertificatePayment,
      bypass: {
        kcp_v2: {
          shop_user_id: "shop-user-id",
        },
      },
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
    transfer: {
      channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
      ...transferPayment,
    },
    mobile: {
      channelKey: "channel-key-bcbb1622-ff80-49d5-adef-49191fda8ede",
      ...mobilePayment,
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
    transfer: {
      channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
      ...transferPayment,
      customer: {
        fullName: customer.fullName,
      },
    },
    mobile: {
      channelKey: "channel-key-4a5daa34-aecb-44af-aaad-e42384acfb6e",
      ...mobilePayment,
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
  hyphen: {
    easyPay: {
      payMethod: "EASY_PAY",
      customer: {
        fullName: customer.fullName,
      },
    },
  },
  eximbay: {
    card: {
      ...cardPayment,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
      },
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
    .with({ pg: { name: "toss", payMethods: "transfer" } }, () =>
      templatedPayment(paymentId, overrides.toss.transfer),
    )
    .with({ pg: { name: "toss", payMethods: "mobile" } }, () =>
      templatedPayment(paymentId, overrides.toss.mobile),
    )
    .with({ pg: { name: "toss", payMethods: "giftCertificate" } }, () =>
      templatedPayment(paymentId, overrides.toss.giftCertificate),
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
    .with({ pg: { name: "nice", payMethods: "transfer" } }, () =>
      templatedPayment(paymentId, overrides.nice.transfer),
    )
    .with({ pg: { name: "nice", payMethods: "mobile" } }, () =>
      templatedPayment(paymentId, overrides.nice.mobile),
    )
    .with({ pg: { name: "nice", payMethods: "giftCertificate" } }, () =>
      templatedPayment(paymentId, overrides.nice.giftCertificate),
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
    .with({ pg: { name: "smartro", payMethods: "transfer" } }, () =>
      templatedPayment(paymentId, overrides.smartro.transfer),
    )
    .with({ pg: { name: "smartro", payMethods: "mobile" } }, () =>
      templatedPayment(paymentId, overrides.smartro.mobile),
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
    .with({ pg: { name: "inicis", payMethods: "transfer" } }, () =>
      templatedPayment(paymentId, overrides.inicis.transfer),
    )
    .with({ pg: { name: "inicis", payMethods: "mobile" } }, () =>
      templatedPayment(paymentId, overrides.inicis.mobile),
    )
    .with({ pg: { name: "inicis", payMethods: "giftCertificate" } }, () =>
      templatedPayment(paymentId, overrides.inicis.giftCertificate),
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
    .with({ pg: { name: "kcp", payMethods: "transfer" } }, () =>
      templatedPayment(paymentId, overrides.kcp.transfer),
    )
    .with({ pg: { name: "kcp", payMethods: "mobile" } }, () =>
      templatedPayment(paymentId, overrides.kcp.mobile),
    )
    .with({ pg: { name: "kcp", payMethods: "giftCertificate" } }, () =>
      templatedPayment(paymentId, overrides.kcp.giftCertificate),
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
    .with({ pg: { name: "kpn", payMethods: "transfer" } }, () =>
      templatedPayment(paymentId, overrides.kpn.transfer),
    )
    .with({ pg: { name: "kpn", payMethods: "mobile" } }, () =>
      templatedPayment(paymentId, overrides.kpn.mobile),
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
    .with({ pg: { name: "ksnet", payMethods: "transfer" } }, () =>
      templatedPayment(paymentId, overrides.ksnet.transfer),
    )
    .with({ pg: { name: "ksnet", payMethods: "mobile" } }, () =>
      templatedPayment(paymentId, overrides.ksnet.mobile),
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
    .with({ pg: { name: "hyphen", payMethods: "easyPay" } }, () =>
      templatedPayment(paymentId, overrides.hyphen.easyPay),
    )
    .with({ pg: { name: "eximbay", payMethods: "card" } }, () =>
      templatedPayment(paymentId, overrides.eximbay.card),
    )
    .exhaustive();
}
