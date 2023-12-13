import { systemVersionSignal } from "~/state/nav";
import type { SystemVersion } from "~/type";

export function VersionSwitch() {
  return (
    <div class="bg-slate-2 text-slate-5 p-2px flex cursor-pointer select-none overflow-hidden rounded-full text-center font-bold shadow-[0px_1px_10px_0px_rgba(0,0,0,0.15)_inset]">
      <div {...getButtonProps("v1", "left")}>V1</div>
      <div {...getButtonProps("v2", "right")}>V2</div>
    </div>
  );
}
export default VersionSwitch;

function getButtonProps(thisVersion: SystemVersion, pos: "left" | "right") {
  const systemVersion = systemVersionSignal.value;
  return {
    onClick: () => (systemVersionSignal.value = thisVersion),
    class: `${systemVersion === thisVersion ? onClass : offClass} ${
      pos === "left" ? "rounded-l-full pl-2 pr-1" : "rounded-r-full pl-1 pr-2"
    }`,
  };
}
const onClass = "bg-orange-600 flex-1 text-white transition-color";
const offClass = "flex-1 transition-color";
