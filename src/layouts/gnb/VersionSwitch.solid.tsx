/* @jsxImportSource solid-js */

import { clsx } from "clsx";
import { Show, createMemo } from "solid-js";
import { useServerFallback } from "~/misc/useServerFallback.solid";
import { setSystemVersion, systemVersion } from "~/state/nav";
import type { SystemVersion } from "~/type";

const pathMappings = {
  "/api/rest-v1": "/api/rest-v2",
  "/api/rest-v2": "/api/rest-v1",
};

const hiddenPaths = ["/release-notes"];

export interface VersionSwitchProps {
  url: string;
  className?: string;
}
export function VersionSwitch(props: VersionSwitchProps) {
  const isHiddenPath = createMemo(() =>
    hiddenPaths.some((path) => new URL(props.url).pathname.startsWith(path)),
  );

  const v1Style = useVersionClass("v1");
  const v2Style = useVersionClass("v2");

  return (
    <Show when={!isHiddenPath()}>
      <button
        type="button"
        style={{ transition: "margin 0.1s" }}
        onClick={() => {
          setSystemVersion((prev) => (prev !== "v1" ? "v1" : "v2"));
          if (location.pathname.startsWith("/docs/")) return;
          location.href =
            Object.entries(pathMappings).find(([from]) =>
              location.pathname.startsWith(from),
            )?.[1] ?? "/";
        }}
        class={clsx(
          "bg-slate-1 border-slate-3 text-12px text-slate-5 p-1px border-1 flex cursor-pointer select-none overflow-hidden whitespace-pre rounded-[6px] text-center font-bold",
          props.className,
        )}
      >
        <div class={v1Style()}>V1</div>
        <div class={v2Style()}>V2</div>
      </button>
    </Show>
  );
}
export default VersionSwitch;

function useVersionClass(thisVersion: SystemVersion) {
  const localSystemVersion = useServerFallback(systemVersion, "all");
  return createMemo(() =>
    clsx(
      "py-4px rounded-[4px]",
      localSystemVersion() === thisVersion
        ? "bg-orange-500 flex-1 text-white px-12px"
        : "flex-1 px-8px",
    ),
  );
}
