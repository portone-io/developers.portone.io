import { Select } from "@kobalte/core/select";
import { createMemo } from "solid-js";
import type { Picture as VitePicture } from "vite-imagetools";

import hyphenLogo from "~/assets/pg-circle/hyphen.png";
import inicisLogo from "~/assets/pg-circle/inicis.png";
import kakaoLogo from "~/assets/pg-circle/kakao.png";
import kcpLogo from "~/assets/pg-circle/kcp.png";
import kpnLogo from "~/assets/pg-circle/kpn.png";
import ksnetLogo from "~/assets/pg-circle/ksnet.png";
import naverLogo from "~/assets/pg-circle/naver.png";
import niceLogo from "~/assets/pg-circle/nice.png";
import smartroLogo from "~/assets/pg-circle/smartro.png";
import tossLogo from "~/assets/pg-circle/toss.png";
import { type Pg, useInteractiveDocs } from "~/state/interactive-docs";

export type PgSelectOption = {
  label: string;
  icon: VitePicture;
};

const PgOptions = {
  nice: { label: "나이스페이먼츠", icon: niceLogo },
  smartro: { label: "스마트로", icon: smartroLogo },
  toss: { label: "토스페이먼츠", icon: tossLogo },
  kpn: { label: "한국결제네트웍스", icon: kpnLogo },
  inicis: { label: "이니시스", icon: inicisLogo },
  ksnet: { label: "KSNET", icon: ksnetLogo },
  kcp: { label: "NHN KCP", icon: kcpLogo },
  kakao: { label: "카카오페이", icon: kakaoLogo },
  naver: { label: "네이버페이", icon: naverLogo },
  tosspay: { label: "토스페이", icon: tossLogo },
  hyphen: { label: "하이픈", icon: hyphenLogo },
} as const satisfies Record<Pg, PgSelectOption>;

interface PgSelectProps {
  class?: string;
}

export function PgSelect(props: PgSelectProps) {
  const { params, setParams, pgOptions } = useInteractiveDocs();
  const options = createMemo(
    () => Object.keys(pgOptions()) as (keyof ReturnType<typeof pgOptions>)[],
  );
  const handleChange = (value: Pg) => {
    setParams("pg", "name", value);
  };
  return (
    <Select
      class={props.class}
      value={params.pg.name}
      onChange={handleChange}
      options={options()}
      placeholder="PG사 선택"
      disallowEmptySelection
      itemComponent={(props) => {
        const optionInfo = createMemo(() => PgOptions[props.item.rawValue]);
        return (
          <Select.Item
            class="flex cursor-default gap-1.5 rounded-md px-1 py-1.5 text-[#09090B] data-[disabled]:text-slate-5 [&:not([data-disabled])]:hover:bg-[#F3F4F6]"
            item={props.item}
          >
            <div class="w-5 flex items-center">
              <Select.ItemIndicator class="flex">
                <i class="i-ic-round-check inline-block" />
              </Select.ItemIndicator>
            </div>
            <img
              src={optionInfo().icon.img.src}
              alt={optionInfo().label}
              class="h-5 w-5"
            />
            <Select.ItemLabel class="text-sm font-medium">
              {optionInfo().label}
            </Select.ItemLabel>
          </Select.Item>
        );
      }}
    >
      <Select.Trigger
        class="flex items-center gap-1 px-3 py-2"
        aria-label="Payment Gateway"
      >
        <Select.Value<
          Pg | undefined
        > class="text-sm text-[#09090B] font-medium">
          {(state) => {
            const selectedOption = createMemo(
              () => state.selectedOption() ?? (Object.keys(PgOptions)[0] as Pg),
            );
            return (
              <div class="flex gap-1.5">
                <img
                  src={PgOptions[selectedOption()].icon.img.src}
                  alt={PgOptions[selectedOption()].label}
                  class="h-5 w-5"
                />
                {PgOptions[selectedOption()].label}
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
