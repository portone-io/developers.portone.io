import { createMemo, on, type ParentProps, Show } from "solid-js";
import { match, P } from "ts-pattern";

import { usePaymentGateway } from "~/state/payment-gateway";
import { PaymentGateway } from "~/type";

export type ConditionProps = ParentProps<{
  pgName?: (pgName: PaymentGateway) => boolean;
}>;

export const Condition = (props: ConditionProps) => {
  const { paymentGateway } = usePaymentGateway();
  const show = createMemo(
    on([paymentGateway], ([paymentGateway]) => {
      const pgNameResolver = (pgName: ConditionProps["pgName"]) =>
        match([pgName, paymentGateway])
          .with([P.nonNullable, P.not("all")], ([pgName, paymentGateway]) =>
            pgName(paymentGateway),
          )
          .with([P.nullish, P._], [P._, "all"], () => true)
          .exhaustive();
      return pgNameResolver(props.pgName);
    }),
  );
  return <Show when={show()}>{props.children}</Show>;
};
