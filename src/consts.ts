import type { Lang } from "./type";

// TODO: 데이터 보충

export type PaymentGateway = {
  displayName: Record<Lang, string>;
  providerIds: readonly PgProviderID[];
};

export const PAYMENT_GATEWAYS = {
  kcp: {
    displayName: {
      en: "NHN KCP",
      ko: "NHN KCP",
    },
    providerIds: ["kcp", "kcp_billing"],
  },
  tosspayments: {
    displayName: {
      en: "Toss Payments",
      ko: "토스페이먼츠",
    },
    providerIds: ["tosspayments", "uplus"],
  },
} as const satisfies Record<string, PaymentGateway>;
export type PaymentGatewayID = keyof typeof PAYMENT_GATEWAYS;

export const PG_PROVIDERS = {
  kcp: {
    ko: "NHN KCP",
    en: "NHN KCP",
  },
  kcp_billing: {
    ko: "NHN KCP (정기)",
    en: "NHN KCP (Subscription)",
  },
  tosspayments: {
    ko: "토스페이먼츠",
    en: "Toss Payments",
  },
  uplus: {
    ko: "(구) 토스페이먼츠",
    en: "Toss Payments (Old)",
  },
} as const satisfies Record<string, Record<Lang, string>>;
export type PgProviderID = keyof typeof PG_PROVIDERS;

export const V2_PG_PROVIDERS = ["tosspayments"] as const;
export type V2PgProviderID = (typeof V2_PG_PROVIDERS)[number];
