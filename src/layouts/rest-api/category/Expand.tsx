export interface ExpandProps {
  className?: string;
  children?: any;
  expand?: boolean;
  onToggle?: (expand: boolean) => void;
  onCollapse?: () => void;
}
export default function Expand({
  className = "",
  children,
  expand,
  onToggle,
  onCollapse,
}: ExpandProps) {
  const expandButton = (
    <ExpandButton
      expand={expand}
      onClick={() => {
        onToggle?.(!expand);
        if (expand) onCollapse?.();
      }}
    />
  );
  return (
    <div class={`flex flex-col gap-20 ${className}`}>
      {expand && expandButton}
      {expand && children}
      {expandButton}
    </div>
  );
}

interface ExpandButtonProps {
  expand?: boolean | undefined;
  onClick?: () => void;
}
function ExpandButton({ expand, onClick }: ExpandButtonProps) {
  return (
    <button class="relative w-full" onClick={onClick}>
      <hr class="absolute top-1/2 z-0 w-full" />
      <div
        class={`${
          expand ? "bg-slate-1" : "bg-white"
        } z-1 border-slate-3 relative inline-flex justify-center gap-2 rounded-full border py-2 pl-6 pr-4`}
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
      </div>
    </button>
  );
}
