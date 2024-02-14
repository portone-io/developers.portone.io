import { useServerFallback } from "~/misc/useServerFallback";
import { systemVersionSignal } from "~/state/nav";
import type { SystemVersion } from "~/type";

const pathMappings = {
  "/api/rest-v1": "/api/rest-v2",
  "/api/rest-v2": "/api/rest-v1",
};

const hiddenPaths = ["/release-notes", "/blog"];

export interface VersionSwitchProps {
  url: string;
  className?: string;
}
export function VersionSwitch({ url, className }: VersionSwitchProps) {
  if (hiddenPaths.some((path) => new URL(url).pathname.startsWith(path)))
    return null;

  const systemVersion = systemVersionSignal.value;
  return (
    <div
      style={{ transition: "margin 0.1s" }}
      onClick={() => {
        systemVersionSignal.value = systemVersion !== "v1" ? "v1" : "v2";
        if (location.pathname.startsWith("/docs/")) return;
        location.href =
          Object.entries(pathMappings).find(([from]) =>
            location.pathname.startsWith(from),
          )?.[1] ?? "/";
      }}
      class={`bg-slate-1 border-slate-3 text-12px text-slate-5 p-1px border-1 flex cursor-pointer select-none overflow-hidden whitespace-pre rounded-[6px] text-center font-bold ${
        className || ""
      }`}
    >
      <div class={getVersionClass("v1")}>V1</div>
      <div class={getVersionClass("v2")}>V2</div>
    </div>
  );
}
export default VersionSwitch;

function getVersionClass(thisVersion: SystemVersion) {
  const systemVersion = useServerFallback(systemVersionSignal.value, "all");
  return `py-4px rounded-[4px] ${
    systemVersion === thisVersion
      ? "bg-orange-500 flex-1 text-white px-12px"
      : "flex-1 px-8px"
  }`;
}
