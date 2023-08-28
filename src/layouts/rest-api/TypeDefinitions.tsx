import { useSignal } from "@preact/signals";
import * as prose from "~/components/prose";
import TwoColumnLayout from "./TwoColumnLayout";
import Expand from "./Expand";
import { getTypenameByRef } from "./schema-utils/type-def";

export interface TypeDefinitionsProps {
  schema: any;
}
export default function TypeDefinitions({ schema }: TypeDefinitionsProps) {
  const expandSignal = useSignal(false);
  const typenames = getTypenames(schema);
  return (
    <div class="flex flex-col">
      <prose.h2>타입 정의</prose.h2>
      <TwoColumnLayout
        left={
          <div class="mt-4">
            API 요청/응답의 각 필드에서 사용되는 타입 정의들을 확인할 수
            있습니다
          </div>
        }
        right={
          <div class="border-slate-3 bg-slate-1 grid-flow-rows grid gap-x-4 gap-y-1 rounded-lg border px-6 py-4 text-xs md:grid-cols-2">
            {typenames.map((typename) => (
              <span>{typename}</span>
            ))}
          </div>
        }
      />
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
  return Object.keys(schema.definitions).map(getTypenameByRef);
}
