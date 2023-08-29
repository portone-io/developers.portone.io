import { useSignal } from "@preact/signals";
import { repr, type Property } from "./schema-utils/type-def";

export interface PropertyDocProps {
  name: string;
  required?: boolean | undefined;
  property: Property;
}
export function PropertyDoc({ name, required, property }: PropertyDocProps) {
  const showMoreSignal = useSignal(false);
  const label = property["x-portone-name"] || "";
  const summary = property["x-portone-summary"] || property.summary || "";
  const description =
    property["x-portone-description"] || property.description || "";
  const showMore = showMoreSignal.value;
  const __html = showMore ? description : summary;
  return (
    <div class="flex flex-col gap-2">
      <div>
        <div class="text-slate-5 flex gap-1 text-xs">
          {label && <span>{label}</span>}
          <span>{required ? "(필수)" : "(선택)"}</span>
        </div>
        <div class="font-mono font-bold leading-none">
          <span>{name}</span>
          <span class="text-slate-5">: {repr(property)}</span>
        </div>
      </div>
      {__html && (
        <div class="text-slate-5 flex flex-col gap-1 text-sm">
          <div dangerouslySetInnerHTML={{ __html }} />
          {summary && description && (
            <button
              class="bg-slate-2 self-end px-1 text-xs"
              onClick={() => (showMoreSignal.value = !showMore)}
            >
              {showMore ? "간단히" : "자세히"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
