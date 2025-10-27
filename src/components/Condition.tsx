import { createMemo, on, type ParentProps, Show, useContext } from "solid-js";
import { match, P } from "ts-pattern";

import { usePaymentGateway } from "~/state/payment-gateway";
import type { Flags } from "~/types/__generated__/flags";

import { ParameterContext } from "./parameter/Parameter";

export type ConditionProps = ParentProps<{
  flag?: (flag: Flags) => boolean;
}>;

export const Condition = (props: ConditionProps) => {
  const { paymentGateway } = usePaymentGateway();
  const parameterContext = useContext(ParameterContext);

  const flags = createMemo(
    () => new Set([paymentGateway(), ...(parameterContext?.flags ?? [])]),
  );

  const show = createMemo(
    on([flags], ([flags]) => {
      const flagResolver = (flagCallback: ConditionProps["flag"]) =>
        [...flags].some((flag) =>
          match([flagCallback, flag])
            .with([P.nonNullable, P.not("all")], ([flagCallback, flag]) =>
              flagCallback(flag),
            )
            .with([P.nullish, P._], [P._, "all"], () => true)
            .exhaustive(),
        );
      return flagResolver(props.flag);
    }),
  );
  return <Show when={show()}>{props.children}</Show>;
};
