import type React from "preact/compat";

export interface ExpandProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  expand?: boolean;
  onToggle?: (expand: boolean) => void;
  onCollapse?: () => void;
}
export default function Expand({
  title = "",
  className = "",
  children,
  expand,
  onToggle,
  onCollapse,
}: ExpandProps) {
  const expandButton = (
    <ExpandButton
      title={title}
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
  title: string;
  expand?: boolean | undefined;
  onClick?: () => void;
}
function ExpandButton({ title, expand, onClick }: ExpandButtonProps) {
  return (
    <button class="relative w-full" onClick={onClick}>
      <hr class="absolute top-1/2 w-full" />
      <div
        class={`${
          expand ? "bg-slate-7 text-white" : "bg-white"
        } border-slate-3 relative inline-flex justify-center gap-2 rounded-full border py-2 pl-6 pr-4`}
      >
        {expand ? (
          <>
            <span>{title ? `${title} 접기` : "접기"}</span>
            <i class="i-ic-baseline-keyboard-arrow-up text-2xl" />
          </>
        ) : (
          <>
            <span>{title ? `${title} 펼치기` : "펼치기"}</span>
            <i class="i-ic-baseline-keyboard-arrow-down text-2xl" />
          </>
        )}
      </div>
    </button>
  );
}
