import { createEffect, createMemo, For, on, Show, splitProps } from "solid-js";

import { usePaymentGateway } from "~/state/payment-gateway";
import { PaymentGateway } from "~/type";

import { Condition, type ConditionProps } from "./Condition";
import { PgOptions } from "./PgSelect";

export type PgSectionProps = ConditionProps;

export const PgSection = (props: PgSectionProps) => {
  const { paymentGateway } = usePaymentGateway();
  const [local, rest] = splitProps(props, ["pgName"]);
  const targetPgSet = createMemo<Set<PaymentGateway>>(
    on(
      () => local.pgName,
      (pgResolver) => {
        if (!pgResolver) return new Set<PaymentGateway>();
        const icons = new Set([...PaymentGateway.options].filter(pgResolver));
        if (icons.size === PaymentGateway.options.length)
          return new Set<PaymentGateway>();
        return icons;
      },
    ),
  );
  createEffect(() => {
    console.log(paymentGateway());
  });
  return (
    <Condition pgName={local.pgName}>
      <Show when={targetPgSet().size > 0}>
        <div class="mb-2 flex flex-col gap-2 rounded-lg bg-gray-50 px-4 py-2">
          <div class="flex items-center gap-2">
            <For each={[...targetPgSet()]}>
              {(pg) => (
                <div class="flex items-center gap-1">
                  <img
                    src={PgOptions[pg].icon.img.src}
                    alt={PgOptions[pg].label}
                    class="h-6 w-6 rounded-full"
                  />
                  <span class="text-sm text-gray-700">
                    {PgOptions[pg].label}
                  </span>
                </div>
              )}
            </For>
          </div>
          <div>{rest.children}</div>
        </div>
      </Show>
    </Condition>
  );
};
