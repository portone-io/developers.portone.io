import { createContextProvider } from "@solid-primitives/context";

import { PaymentGateway } from "~/type";

export type PaymentGatewayInit = {
  paymentGateway: () => PaymentGateway | "all";
  setPaymentGateway: (paymentGateway: PaymentGateway | "all") => void;
};

const [PaymentGatewayProvider, usePaymentGateway] = createContextProvider(
  (props: PaymentGatewayInit) => {
    return props;
  },
  {
    paymentGateway: () => "all",
    setPaymentGateway: (_: PaymentGateway | "all") => {},
  },
);

export { PaymentGatewayProvider, usePaymentGateway };
