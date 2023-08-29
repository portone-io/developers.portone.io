import { useSignal } from "@preact/signals";
import * as prose from "~/components/prose";
import Expand from "./Expand";
import { crawlRefs, getTypenameByRef } from "./schema-utils/type-def";

export interface TypeDefinitionsProps {
  schema: any;
}
export default function TypeDefinitions({ schema }: TypeDefinitionsProps) {
  const expandSignal = useSignal(false);
  const typenames = getTypenames(schema);
  return (
    <div class="flex flex-col">
      <prose.h2>타입 정의</prose.h2>
      <div class="mt-4">
        API 요청/응답의 각 필드에서 사용되는 타입 정의들을 확인할 수 있습니다
      </div>
      <div class="border-slate-3 bg-slate-1 grid-flow-rows mt-4 grid gap-x-4 gap-y-1 rounded-lg border px-6 py-4 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {typenames.map((typename) => (
          <span>{typename}</span>
        ))}
      </div>
      <Expand
        className="mt-10"
        expand={expandSignal.value}
        onExpand={(v) => (expandSignal.value = v)}
      >
        TODO
      </Expand>
    </div>
  );
}

function getTypenames(schema: any) {
  return crawlRefs(schema).map(getTypenameByRef);
}
