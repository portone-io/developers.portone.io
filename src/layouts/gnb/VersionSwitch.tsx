import { useServerFallback } from "~/misc/useServerFallback";
import { systemVersionSignal } from "~/state/nav";
import type { SystemVersion } from "~/type";

export interface VersionSwitchProps {
  className?: string;
}
export function VersionSwitch({ className }: VersionSwitchProps) {
  const systemVersion = systemVersionSignal.value;
  return (
    <div
      style={{ transition: "margin 0.1s" }}
      onClick={() => {
        systemVersionSignal.value = systemVersion !== "v1" ? "v1" : "v2";
        if (!location.pathname.startsWith("/docs/")) location.href = "/";
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
