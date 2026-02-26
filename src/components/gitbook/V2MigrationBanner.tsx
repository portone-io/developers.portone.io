import { useLocation, useNavigate } from "@solidjs/router";
import { createMemo, type JSXElement, Show, startTransition } from "solid-js";

import Hint from "~/components/Hint";
import type { DocsEntry } from "~/content/config";
import { useSystemVersion } from "~/state/system-version";
import type { Lang } from "~/type";

const pathMappings = {
  "/api/rest-v1": "/api/rest-v2",
};

interface Props {
  lang: Lang;
  versionVariants?: DocsEntry["versionVariants"];
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
  const location = useLocation();
  const navigate = useNavigate();
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
            type="button"
            onClick={() => {
              void startTransition(() => {
                setSystemVersion("v2");
              });

              const mappedPath =
                Object.entries(pathMappings).find(([from]) =>
                  location.pathname.startsWith(from),
                )?.[1] ??
                (props.versionVariants?.v2 && props.versionVariants.v2);
              if (mappedPath) navigate(mappedPath);
              else if (
                ["/opi/", "/sdk/"].some((path) =>
                  location.pathname.startsWith(path),
                )
              )
                return;
              else navigate("/");
            }}
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
