import { Select } from "@kobalte/core/select";
import { createMemo } from "solid-js";

import { type PayMethod, useInteractiveDocs } from "~/state/interactive-docs";

export type PayMethodSelectOption = {
  label: string;
};

const PaymentOptions = {
  card: { label: "카드결제" },
  virtualAccount: { label: "가상계좌" },
} as const satisfies Record<PayMethod, { label: string }>;

interface PayMethodSelectProps {
  class?: string;
}

export function PayMethodSelect(props: PayMethodSelectProps) {
  const { params, setParams, pgOptions } = useInteractiveDocs();
  const options = createMemo(() => {
    return pgOptions()[params.pg.name]?.payMethods ?? [];
  });
  const handleChange = (value: PayMethod) => {
    setParams("pg", "payMethods", value);
  };
  return (
    <Select
      class={props.class}
      value={params.pg.payMethods}
      onChange={handleChange}
      options={options()}
      placeholder="결제수단을 선택해주세요."
      disallowEmptySelection
      itemComponent={(props) => (
        <Select.Item
          class="flex cursor-default gap-1.5 rounded-md px-1 py-1.5 text-[#09090B] data-[disabled]:text-slate-5 [&:not([data-disabled])]:hover:bg-[#F3F4F6]"
          item={props.item}
        >
          <div class="w-5 flex items-center">
            <Select.ItemIndicator class="flex">
              <i class="i-ic-round-check inline-block" />
            </Select.ItemIndicator>
          </div>
          <Select.ItemLabel class="text-sm font-medium">
            {PaymentOptions[props.item.rawValue].label}
          </Select.ItemLabel>
        </Select.Item>
      )}
    >
      <Select.Trigger
        class="w-full flex items-center justify-between gap-1"
        aria-label="Payment Gateway"
      >
        <Select.Value<
          PayMethod | undefined
        > class="text-sm text-slate-9 font-medium">
          {(state) => {
            const selectedOption = createMemo(
              () =>
                state.selectedOption() ??
                (Object.keys(PaymentOptions)[0] as PayMethod),
            );
            return (
              <div class="flex gap-1.5">
                {PaymentOptions[selectedOption()].label}
              </div>
            );
          }}
        </Select.Value>
        <Select.Icon class="flex items-center">
          <i class="i-ic-baseline-keyboard-arrow-down inline-block text-xl" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content class="border rounded-md bg-white p-1.5 shadow-md">
          <Select.Listbox class="flex flex-col gap-.5" />
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
