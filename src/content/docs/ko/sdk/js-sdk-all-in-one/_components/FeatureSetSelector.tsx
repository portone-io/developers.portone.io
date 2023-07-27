import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import type * as React from "react";

import {
  PAYMENT_GATEWAYS,
  PG_PROVIDERS,
  PaymentGatewayID,
  V2_PG_PROVIDERS,
} from "~/consts";
import FeatureSet from "../_state/featureSet";
import type { PgProviderID } from "~/consts";

const FeatureSetSelector: React.FC = () => {
  return (
    <div class="flex flex-col gap-4 rounded-lg border border-slate-300 p-4">
      <PgProviderSelector />
      <ServiceVersionSelector />
    </div>
  );
};

const PgProviderSelector: React.FC = () => {
  const selectedPg = useSignal<PaymentGatewayID | "">("");
  const selectedProvider = useSignal<PgProviderID | "">("");

  const pgProviderOptions = useComputed(() =>
    selectedPg.value
      ? [...PAYMENT_GATEWAYS[selectedPg.value].providerIds].filter(
          (providerId) => !FeatureSet.pgProviders.value.includes(providerId)
        )
      : null
  );
  const allSelected = useComputed(() => {
    const pg = selectedPg.value;
    const provider = selectedProvider.value;
    return !!(pg && provider);
  });
  return (
    <div class="flex flex-col gap-4">
      <p class="text-lg font-medium">PG사 모듈 선택하기</p>
      {FeatureSet.pgProviders.value.length > 0 && (
        <ul class="flex flex-wrap gap-3">
          {FeatureSet.pgProviders.value.map((provider) => (
            <li class="flex items-center gap-2 rounded-full bg-slate-200 px-4 py-1">
              {PG_PROVIDERS[provider].ko}
              <button
                class="flex items-center"
                onClick={() => {
                  FeatureSet.pgProviders.value =
                    FeatureSet.pgProviders.value.filter(
                      (id) => id !== provider
                    );
                }}
              >
                <i class="i-ic-baseline-cancel inline-block" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div class="flex gap-2">
        <select
          class="flex-1 rounded border border-slate-300 bg-transparent p-2"
          value={selectedPg.value}
          onChange={(e) => {
            selectedPg.value = e.currentTarget.value as PaymentGatewayID | "";
            selectedProvider.value = pgProviderOptions.value?.[0] ?? "";
          }}
        >
          <option value="">PG사 선택</option>
          {Object.entries(PAYMENT_GATEWAYS)
            .filter(
              ([, info]) =>
                [...info.providerIds].filter(
                  (id) => !FeatureSet.pgProviders.value.includes(id)
                ).length > 0
            )
            .map(([pgId, info]) => (
              <option key={pgId} value={pgId}>
                {info.displayName.ko}
              </option>
            ))}
        </select>
        <select
          class="flex-1 rounded border border-slate-300 bg-transparent p-2"
          value={selectedProvider.value}
          onChange={(e) => {
            selectedProvider.value = e.currentTarget.value as PgProviderID | "";
          }}
        >
          <option value="">결제 모듈 선택</option>
          {selectedPg.value &&
            pgProviderOptions.value?.map((providerId) => (
              <option key={providerId} value={providerId}>
                {PG_PROVIDERS[providerId].ko}
              </option>
            ))}
        </select>
        <button
          class="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100 disabled:opacity-40"
          disabled={!allSelected.value}
          onClick={() => {
            if (selectedPg.value && selectedProvider.value) {
              if (
                !FeatureSet.pgProviders.value.includes(selectedProvider.value)
              ) {
                FeatureSet.pgProviders.value = [
                  ...FeatureSet.pgProviders.value,
                  selectedProvider.value,
                ];
              }
              selectedPg.value = "";
              selectedProvider.value = "";
            }
          }}
        >
          + 추가
        </button>
      </div>
    </div>
  );
};

const ServiceVersionSelector: React.FC = () => {
  const nonV2Providers = useComputed(() =>
    FeatureSet.pgProviders.value.filter(
      (v) => !(V2_PG_PROVIDERS as readonly string[]).includes(v)
    )
  );

  useSignalEffect(() => {
    if (
      nonV2Providers.value.length > 0 &&
      FeatureSet.serviceVersion.value === "v2"
    ) {
      FeatureSet.serviceVersion.value = null;
    }
  });

  return (
    <div class="flex flex-col gap-4">
      <p class="text-lg font-medium">서비스 버전 선택하기</p>
      <div class="flex gap-4 px-1">
        <label class="flex items-center gap-2">
          <input
            name="service-version"
            type="radio"
            onChange={(e) => {
              if (e.currentTarget.checked) {
                FeatureSet.serviceVersion.value = "v1";
              }
            }}
            checked={FeatureSet.serviceVersion.value === "v1"}
          />
          V1
        </label>
        <label
          class="flex items-center gap-2"
          title={
            nonV2Providers.value.length > 0
              ? `선택하신 PG 모듈 중 ${nonV2Providers.value
                  .map((id) => PG_PROVIDERS[id].ko)
                  .join(", ")} 모듈은 V2 서비스에서 사용할 수 없습니다.`
              : undefined
          }
        >
          <input
            name="service-version"
            type="radio"
            onChange={(e) => {
              if (e.currentTarget.checked) {
                FeatureSet.serviceVersion.value = "v2";
              }
            }}
            disabled={nonV2Providers.value.length > 0}
            checked={FeatureSet.serviceVersion.value === "v2"}
          />
          V2
        </label>
      </div>
    </div>
  );
};

export default FeatureSetSelector;
