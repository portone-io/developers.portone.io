import { createSignal, createUniqueId } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useInteractiveDocs } from "~/state/interactive-docs";

import { PayMethodSelect } from "./PayMethodSelect";

export interface CodePreviewProps {
  renderId: string;
}

export function CodePreview() {
  const { preview } = useInteractiveDocs();
  const [renderId, setRenderId] = createSignal(createUniqueId());
  return (
    <div class="grid grid-rows-[min-content_min-content_1fr] mb-2 gap-y-2 rounded-xl bg-slate-8 p-2">
      <div class="flex gap-2.5 rounded-lg bg-slate-7 px-2 py-2">
        <div class="flex items-center gap-1 gap-1 rounded-md bg-slate-2 px-3 py-1 text-slate-9">
          <i class="i-material-symbols-content-copy-outline inline-block text-base"></i>
          <span class="text-xs font-medium leading-6">미리보기</span>
        </div>
        <button
          onClick={() => setRenderId(createUniqueId())}
          type="button"
          class="flex items-center gap-1 gap-1 rounded-md px-3 py-1 text-slate-3 hover:bg-slate-6"
        >
          <i class="i-mdi-reload inline-block text-base"></i>
          <span class="text-xs font-medium leading-6">재시도</span>
        </button>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm text-white font-medium leading-[18.2px]">
          결제수단
        </span>
        <PayMethodSelect class="w-full border rounded-md bg-white px-3 py-2.5" />
      </div>
      <Dynamic component={preview()} renderId={renderId()} />
    </div>
  );
}
