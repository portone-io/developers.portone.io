import type { Signal } from "@preact/signals";

export interface Kv {
  key: string;
  value: string;
}
export type KvList = Kv[];
export interface RequestHeaderEditorProps {
  reqHeaderSignal: Signal<KvList>;
}
export default function RequestHeaderEditor({
  reqHeaderSignal,
}: RequestHeaderEditorProps) {
  const reqHeader = reqHeaderSignal.value;
  function updateReqHeader(index: number, kv: Partial<Kv>) {
    const newReqHeader = reqHeader.slice();
    newReqHeader[index] = { ...newReqHeader[index]!, ...kv };
    reqHeaderSignal.value = newReqHeader;
  }
  function addReqHeader() {
    reqHeaderSignal.value = [...reqHeader, { key: "", value: "" }];
  }
  function delReqHeader(index: number) {
    const newReqHeader = reqHeader.slice();
    newReqHeader.splice(index, 1);
    reqHeaderSignal.value = newReqHeader;
  }
  return (
    <div class="absolute flex h-full w-full flex-col gap-1 overflow-y-scroll">
      <div class="sticky top-0 grid grid-cols-[1fr_1fr_1.5rem] gap-1 text-sm">
        <div class="bg-slate-1 px-2 py-1">Key</div>
        <div class="bg-slate-1 px-2 py-1">Value</div>
        <div />
      </div>
      {reqHeader.map(({ key, value }, index) => (
        <div key={index} class="grid grid-cols-[1fr_1fr_1.5rem] gap-1 text-sm">
          <input
            class="border-slate-2 w-full border px-2 py-1"
            value={key}
            onInput={(e) =>
              updateReqHeader(index, { key: e.currentTarget.value })
            }
          />
          <input
            class="border-slate-2 w-full border px-2 py-1"
            value={value}
            onInput={(e) =>
              updateReqHeader(index, { value: e.currentTarget.value })
            }
          />
          <button
            class="text-slate-3 hover:text-slate-7 inline-flex items-center text-lg"
            onClick={() => delReqHeader(index)}
          >
            <i class="i-ic-twotone-delete-forever" />
          </button>
        </div>
      ))}
      <button
        class="bg-slate-1 mr-1.75rem sticky bottom-0 inline-flex items-center justify-center py-1 text-lg opacity-50 hover:opacity-100"
        onClick={addReqHeader}
      >
        <i class="i-ic-baseline-plus" />
      </button>
    </div>
  );
}

export function kvListToObject(kvList: KvList): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { key, value } of kvList) {
    const _key = key.trim();
    if (!_key) continue;
    result[_key] = value;
  }
  return result;
}
