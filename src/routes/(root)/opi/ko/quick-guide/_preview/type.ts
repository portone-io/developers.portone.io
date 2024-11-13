import type { ConvertToPgParam, PgOptions } from "~/state/interactive-docs";

export const pgOptions = {
  toss: {
    payMethods: ["card", "virtualAccount"],
  },
  nice: {
    payMethods: ["card", "virtualAccount"],
  },
} as const satisfies PgOptions;

export type Params = {
  smartRouting: boolean;
  pg: ConvertToPgParam<typeof pgOptions>;
};

export type Sections =
  | "client:import-portone-sdk"
  | "client:request-payment"
  | "client:payment-id-description"
  | "client:handle-payment-error"
  | "client:request-server-side-verification"
  | "client:handle-payment-status:failed"
  | "client:handle-payment-status:paid"
  | "client:handle-payment-status:virtual-account-issued"
  | "client:smart-routing:channel-group-id"
  | "server:import-portone-sdk";
