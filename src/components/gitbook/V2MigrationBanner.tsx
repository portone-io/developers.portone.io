import { useLocation, useNavigate } from "@solidjs/router";
import { createMemo, type JSXElement, Show, startTransition } from "solid-js";

import Hint from "~/components/Hint";
import type { DocsEntry } from "~/content/config";
import { useSystemVersion } from "~/state/system-version";
import { navigateAfterVersionSwitch } from "~/state/system-version/navigate";
import type { Lang, SystemVersion } from "~/type";

interface Props {
  lang: Lang;
  versionVariants?: DocsEntry["versionVariants"];
  targetVersions?: SystemVersion[];
}

const messages: Record<
  Lang,
  {
    v1Only: string;
    recommendV2: string;
    viewV2Doc: string;
  }
> = {
  ko: {
    v1Only: "이 문서는 V1(구 아임포트) 연동 고객사 대상입니다.",
    recommendV2: "신규 연동의 경우 V2 버전 사용을 권장합니다.",
    viewV2Doc: "V2로 이동하기",
  },
};

export default function V2MigrationBanner(props: Props): JSXElement {
  const location = useLocation();
  const navigate = useNavigate();
  const { systemVersion, setSystemVersion } = useSystemVersion();
  const msg = createMemo(() => messages[props.lang]);

  return (
    <Show when={systemVersion() === "v1"}>
      <Hint style="info">
        <div class="flex flex-col items-start gap-2">
          <p class="text-[15px] font-medium text-slate-900">
            {msg().v1Only} {msg().recommendV2}
          </p>
          <button
            type="button"
            onClick={() => {
              void startTransition(() => {
                setSystemVersion("v2");
              });

              navigateAfterVersionSwitch({
                pathname: location.pathname,
                newVersion: "v2",
                navigate,
                versionVariants: props.versionVariants,
                targetVersions: props.targetVersions,
              });
            }}
            class="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-[12px] py-[7px] text-[13px]"
          >
            {msg().viewV2Doc}
            <span class="icon-[ic--baseline-arrow-forward]"></span>
          </button>
        </div>
      </Hint>
    </Show>
  );
}
