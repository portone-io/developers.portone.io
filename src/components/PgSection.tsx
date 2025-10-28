import { createMemo, For, type ParentProps, Show, splitProps } from "solid-js";

import { PaymentGateway } from "~/type";

import { Condition } from "./Condition";
import { PgOptions } from "./PgSelect";

export type PgSectionProps = ParentProps<{
  pgName: (pgName: PaymentGateway) => boolean;
}>;

export const PgSection = (props: PgSectionProps) => {
  const [local, rest] = splitProps(props, ["pgName"]);
  const targetPgSet = createMemo<Set<PaymentGateway>>(() => {
    if (!local.pgName) return new Set<PaymentGateway>();
    const icons = new Set([...PaymentGateway.options].filter(local.pgName));
    if (icons.size === PaymentGateway.options.length)
      return new Set<PaymentGateway>();
    return icons;
  });
  return (
    <Condition flag={local.pgName}>
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
