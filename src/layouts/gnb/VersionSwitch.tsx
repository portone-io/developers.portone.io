import { systemVersionSignal } from "~/state/nav";
import type { SystemVersion } from "~/type";

export function VersionSwitch() {
  const systemVersion = systemVersionSignal.value;
  return (
    <div
      onClick={() => {
        systemVersionSignal.value = systemVersion !== "v1" ? "v1" : "v2";
        if (!location.pathname.startsWith("/docs/")) location.href = "/";
      }}
      class="bg-slate-2 text-12px text-slate-5 p-2px flex cursor-pointer select-none overflow-hidden whitespace-pre rounded-full text-center font-bold shadow-[0px_1px_10px_0px_rgba(0,0,0,0.15)_inset]"
    >
      <div class={getVersionClass("v1")}>
        {systemVersion !== "v2" ? "V1 API" : "V1"}
      </div>
      <div class={getVersionClass("v2")}>
        {systemVersion === "v2" ? "V2 API" : "V2"}
      </div>
    </div>
  );
}
export default VersionSwitch;

function getVersionClass(thisVersion: SystemVersion) {
  const systemVersion = systemVersionSignal.value;
  return `px-8px py-4px rounded-full ${
    systemVersion === thisVersion
      ? "bg-orange-500 flex-1 text-white"
      : "flex-1 transition-color"
  }`;
}
