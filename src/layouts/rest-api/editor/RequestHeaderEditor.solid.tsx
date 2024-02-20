/* @jsxImportSource solid-js */

import { For, type Setter } from "solid-js";

export interface Kv {
  key: string;
  value: string;
}
export type KvList = Kv[];
export interface RequestHeaderEditorProps {
  reqHeaders: KvList;
  setReqHeaders: Setter<KvList>;
}

export default function RequestHeaderEditor(props: RequestHeaderEditorProps) {
  function updateReqHeader(index: number, kv: Partial<Kv>) {
    const newReqHeaders = props.reqHeaders.slice();
    newReqHeaders[index] = { ...newReqHeaders[index]!, ...kv };
    props.setReqHeaders(newReqHeaders);
  }
  function addReqHeader() {
    props.setReqHeaders([...props.reqHeaders, { key: "", value: "" }]);
  }
  function delReqHeader(index: number) {
    const newReqHeaders = props.reqHeaders.slice();
    newReqHeaders.splice(index, 1);
    props.setReqHeaders(newReqHeaders);
  }
  return (
    <div class="absolute flex h-full w-full flex-col gap-1 overflow-y-scroll">
      <div class="sticky top-0 grid grid-cols-[1fr_1fr_1.5rem] gap-1 text-sm">
        <div class="bg-slate-1 px-2 py-1">Key</div>
        <div class="bg-slate-1 px-2 py-1">Value</div>
        <div />
      </div>
      <For each={props.reqHeaders}>
        {(header, index) => (
          <div class="grid grid-cols-[1fr_1fr_1.5rem] gap-1 text-sm">
            <input
              class="border-slate-2 w-full border px-2 py-1"
              value={header.key}
              onInput={(e) =>
                updateReqHeader(index(), { key: e.currentTarget.value })
              }
            />
            <input
              class="border-slate-2 w-full border px-2 py-1"
              value={header.value}
              onInput={(e) =>
                updateReqHeader(index(), { value: e.currentTarget.value })
              }
            />
            <button
              type="button"
              class="text-slate-3 hover:text-slate-7 inline-flex items-center text-lg"
              onClick={() => delReqHeader(index())}
            >
              <i class="i-ic-twotone-delete-forever" />
            </button>
          </div>
        )}
      </For>
      <button
        type="button"
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
