import type { ConvertToPgParam, PgOptions } from "~/state/interactive-docs";

export const pgOptions = {
  toss: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  nice: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  smartro: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer", "mobile"],
  },
  kpn: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer", "mobile"],
  },
  inicis: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  ksnet: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer", "mobile"],
  },
  kcp: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  kakao: {
    payMethods: ["easyPay"],
  },
  naver: {
    payMethods: ["easyPay"],
  },
  tosspay: {
    payMethods: ["easyPay"],
  },
  hyphen: {
    payMethods: ["easyPay"],
  },
  eximbay: {
    payMethods: ["card"],
  },
} as const satisfies PgOptions;

export type Params = {
  smartRouting: boolean;
  pg: ConvertToPgParam<typeof pgOptions>;
};

// 문서에 노출되는 순서대로
export type Sections =
  | "client:import-portone-sdk"
  | "client:fetch-item"
  | "client:request-payment"
  | "client:handle-payment-error"
  | "client:request-server-side-verification"
  | "client:handle-payment-status:paid"
  | "client:handle-payment-status:virtual-account-issued"
  | "client:handle-payment-status:failed"
  | "server:import-portone-sdk"
  | "server:portone-api-secret"
  | "server:complete-payment"
  | "server:complete-payment:get-payment"
  | "server:complete-payment:verify-payment"
  | "server:webhook"
  | "server:webhook:raw-body"
  | "server:webhook:verify"
  | "server:webhook:complete-payment";
