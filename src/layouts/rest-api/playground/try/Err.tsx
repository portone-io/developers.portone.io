export interface ErrProps {
  children: any;
}
export default function Err({ children }: ErrProps) {
  return (
    <div class="grid grid-rows-[auto_minmax(0,1fr)] gap-1">
      <span class="text-xs font-bold">Error</span>
      <div class="text-red-6 whitespace-pre-wrap text-sm">{children}</div>
    </div>
  );
}
