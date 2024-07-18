import { For } from "solid-js";

export interface Kv {
  key: string;
  value: string;
}
export type KvList = Kv[];
export interface RequestHeaderEditorProps {
  reqHeader: KvList;
  onChange: (reqHeader: KvList) => void;
}
export default function RequestHeaderEditor(props: RequestHeaderEditorProps) {
  function updateReqHeader(index: number, kv: Partial<Kv>) {
    const newReqHeader = props.reqHeader.slice();
    newReqHeader[index] = { ...newReqHeader[index]!, ...kv };
    props.onChange(newReqHeader);
  }
  function addReqHeader() {
    props.onChange([...props.reqHeader, { key: "", value: "" }]);
  }
  function delReqHeader(index: number) {
    const newReqHeader = props.reqHeader.slice();
    newReqHeader.splice(index, 1);
    props.onChange(newReqHeader);
  }
  return (
    <div class="absolute h-full w-full flex flex-col gap-1 overflow-y-scroll">
      <div class="sticky top-0 grid grid-cols-[1fr_1fr_1.5rem] gap-1 text-sm">
        <div class="bg-slate-1 px-2 py-1">Key</div>
        <div class="bg-slate-1 px-2 py-1">Value</div>
        <div />
      </div>
      <For each={props.reqHeader}>
        {(header, index) => (
          <div class="grid grid-cols-[1fr_1fr_1.5rem] gap-1 text-sm">
            <input
              class="w-full border border-slate-2 px-2 py-1"
              value={header.key}
              onInput={(e) =>
                updateReqHeader(index(), { key: e.currentTarget.value })
              }
            />
            <input
              class="w-full border border-slate-2 px-2 py-1"
              value={header.value}
              onInput={(e) =>
                updateReqHeader(index(), { value: e.currentTarget.value })
              }
            />
            <button
              class="inline-flex items-center text-lg text-slate-3 hover:text-slate-7"
              onClick={() => delReqHeader(index())}
            >
              <i class="i-ic-twotone-delete-forever" />
            </button>
          </div>
        )}
      </For>
      <button
        class="sticky bottom-0 mr-1.75rem inline-flex items-center justify-center bg-slate-1 py-1 text-lg opacity-50 hover:opacity-100"
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
