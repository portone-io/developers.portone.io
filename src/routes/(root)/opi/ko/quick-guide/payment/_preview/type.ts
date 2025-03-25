import type { ConvertToPgParam, PgOptions } from "~/state/interactive-docs";

export const pgOptions = {
  toss: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer"],
  },
  nice: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer"],
  },
  smartro: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer"],
  },
  kpn: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer"],
  },
  inicis: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer"],
  },
  ksnet: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer"],
  },
  kcp: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer"],
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
