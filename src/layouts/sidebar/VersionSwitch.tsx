import { systemVersionSignal } from "~/state/sidebar";
import type { SystemVersion } from "~/type";

export function VersionSwitch() {
  return (
    <div class="bg-slate-2 text-slate-5 mx-2 flex cursor-pointer select-none overflow-hidden rounded text-center font-bold">
      <div {...getButtonProps("v1")}>V1</div>
      <div {...getButtonProps("v2")}>V2 (Beta)</div>
    </div>
  );
}
export default VersionSwitch;

function getButtonProps(thisVersion: SystemVersion) {
  const systemVersion = systemVersionSignal.value;
  return {
    onClick: () => (systemVersionSignal.value = thisVersion),
    class: systemVersion === thisVersion ? onClass : offClass,
  };
}
const onClass = "bg-orange-600 flex-1 text-white transition-color";
const offClass = "flex-1 transition-color";
