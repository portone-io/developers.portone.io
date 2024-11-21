import type { ConvertToPgParam, PgOptions } from "~/state/interactive-docs";

export const pgOptions = {
  toss: {
    payMethods: ["card", "virtualAccount"],
  },
  nice: {
    payMethods: ["card", "virtualAccount"],
  },
  smartro: {
    payMethods: ["card", "virtualAccount"],
  },
  kpn: {
    payMethods: ["card", "virtualAccount"],
  },
  inicis: {
    payMethods: ["card", "virtualAccount"],
  },
  ksnet: {
    payMethods: ["card", "virtualAccount"],
  },
  kcp: {
    payMethods: ["card", "virtualAccount"],
  },
} as const satisfies PgOptions;

export type Params = {
  smartRouting: boolean;
  pg: ConvertToPgParam<typeof pgOptions>;
};

export type Sections =
  | "client:import-portone-sdk"
  | "client:fetch-item"
  | "client:request-payment"
  | "client:payment-id"
  | "client:customer-data"
  | "client:custom-data"
  | "client:handle-payment-error"
  | "client:request-server-side-verification"
  | "client:handle-payment-status:failed"
  | "client:handle-payment-status:paid"
  | "client:handle-payment-status:virtual-account-issued"
  | "server:import-portone-sdk"
  | "server:complete-payment"
  | "server:complete-payment:get-payment"
  | "server:complete-payment:verify-payment"
  | "server:webhook"
  | "server:webhook:raw-body"
  | "server:webhook:verify"
  | "server:webhook:complete-payment";
