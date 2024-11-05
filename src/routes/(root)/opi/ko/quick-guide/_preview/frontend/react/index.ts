import type { Tab } from "~/components/code-preview/index.jsx";

import type { Params } from "../../type.js";
import app from "./app.jsx";

export type { Params };
export type Sections =
  | "client:import-portone-sdk"
  | "client:request-payment"
  | "client:payment-id-description"
  | "client:handle-payment-error"
  | "client:request-server-side-verification"
  | "client:handle-payment-status:failed"
  | "client:handle-payment-status:paid"
  | "client:handle-payment-status:virtual-account-issued"
  | "client:smart-routing:channel-group-id";

export const tabs = [{ fileName: "app.jsx", code: app }] as const satisfies Tab<
  Params,
  Sections
>[];
