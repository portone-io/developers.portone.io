import { createMemo, on, type ParentProps, Show } from "solid-js";
import { match, P } from "ts-pattern";

import { usePaymentGateway } from "~/state/payment-gateway";
import { type PaymentGateway } from "~/type";

export type ConditionProps = ParentProps<{
  flag?: (flag: PaymentGateway) => boolean;
}>;

export const Condition = (props: ConditionProps) => {
  const { paymentGateway } = usePaymentGateway();
  const show = createMemo(
    on([paymentGateway], ([paymentGateway]) => {
      const flagResolver = (flag: ConditionProps["flag"]) =>
        match([flag, paymentGateway])
          .with([P.nonNullable, P.not("all")], ([flag, paymentGateway]) =>
            flag(paymentGateway),
          )
          .with([P.nullish, P._], [P._, "all"], () => true)
          .exhaustive();
      return flagResolver(props.flag);
    }),
  );
  return <Show when={show()}>{props.children}</Show>;
};
