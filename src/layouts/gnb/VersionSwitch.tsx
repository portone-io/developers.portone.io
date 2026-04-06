import { useLocation, useNavigate } from "@solidjs/router";
import clsx from "clsx";
import { createMemo, Show, startTransition } from "solid-js";

import type { DocsEntry } from "~/content/config";
import { useSystemVersion } from "~/state/system-version";
import { navigateAfterVersionSwitch } from "~/state/system-version/navigate";
import type { SystemVersion } from "~/type";

const hiddenPaths = ["/release-notes", "/blog", "/platform"];

export interface VersionSwitchProps {
  class?: string;
  docData?: Pick<DocsEntry, "versionVariants" | "targetVersions">;
}
export function VersionSwitch(props: VersionSwitchProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const show = createMemo(
    () => !hiddenPaths.some((path) => location.pathname.startsWith(path)),
  );

  const { systemVersion, setSystemVersion } = useSystemVersion();

  return (
    <Show when={show()}>
      <div class="relative">
        <div
          onClick={() => {
            const newVersion = systemVersion() !== "v1" ? "v1" : "v2";
            void startTransition(() => {
              setSystemVersion(newVersion);
            });

            navigateAfterVersionSwitch({
              pathname: location.pathname,
              newVersion,
              navigate,
              versionVariants: props.docData?.versionVariants,
              targetVersions: props.docData?.targetVersions,
            });
          }}
          class={clsx(
            "flex cursor-pointer select-none overflow-hidden whitespace-pre rounded-md bg-slate-1 p-1 text-center text-[13px] text-slate-5 font-medium leading-[15.6px] <md:p-.5",
            props.class,
          )}
        >
          <div class={getVersionClass("v1", systemVersion())}>V1</div>
          <div class={getVersionClass("v2", systemVersion())}>V2</div>
        </div>
      </div>
    </Show>
  );
}

function getVersionClass(
  thisVersion: SystemVersion,
  systemVersion: SystemVersion,
) {
  return `px-2 py-1 <md:py-.5 <md:px-2 flex-1 rounded-[4px] ${
    systemVersion === thisVersion ? "bg-portone text-white" : ""
  }`;
}
