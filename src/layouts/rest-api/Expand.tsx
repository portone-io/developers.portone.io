export interface ExpandProps {
  className?: string;
  children?: any;
  expand?: boolean;
  onExpand?: (expand: boolean) => void;
}
export default function Expand({
  className = "",
  children,
  expand,
  onExpand,
}: ExpandProps) {
  return (
    <div class={`flex flex-col gap-10 ${className}`}>
      {expand && (
        <div class={`flex flex-col gap-10 ${expand ? "" : "hidden"}`}>
          {children}
        </div>
      )}
      <button
        class="bg-slate-1 border-slate-3 inline-flex gap-2 place-self-center rounded-full border py-2 pl-6 pr-4"
        onClick={() => onExpand?.(!expand)}
      >
        {expand ? (
          <>
            <span>접기</span>
            <i class="i-ic-baseline-keyboard-arrow-up text-2xl" />
          </>
        ) : (
          <>
            <span>펼치기</span>
            <i class="i-ic-baseline-keyboard-arrow-down text-2xl" />
          </>
        )}
      </button>
    </div>
  );
}
