import { createMemo, type JSXElement, Show } from "solid-js";

import Hint from "~/components/Hint";
import { useSystemVersion } from "~/state/system-version";
import type { Lang } from "~/type";

interface Props {
  lang: Lang;
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
    v1Only: "이 문서는 V1 전용입니다.",
    recommendV2: "최신 V2 버전 사용을 권장합니다.",
    viewV2Doc: "V2 문서 보기",
  },
};

export default function V2MigrationBanner(props: Props): JSXElement {
  const { systemVersion, setSystemVersion } = useSystemVersion();
  const msg = createMemo(() => messages[props.lang]);

  return (
    <Show when={systemVersion() === "v1"}>
      <Hint style="info">
        <div class="flex flex-col gap-2">
          <p>
            <strong>{msg().v1Only}</strong> {msg().recommendV2}
          </p>
          <button
            onClick={() => setSystemVersion("v2")}
            class="inline-flex items-center gap-1 text-blue-600 font-500 hover:text-blue-700"
          >
            {msg().viewV2Doc}
            <span class="i-ic-baseline-arrow-forward"></span>
          </button>
        </div>
      </Hint>
    </Show>
  );
}
