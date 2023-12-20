import Card from "../Card";

export interface ErrProps {
  children: any;
}
export default function Err({ children }: ErrProps) {
  return (
    <Card titleClass="bg-slate-1" title="Error">
      <div class="relative flex-1">
        <div class="text-red-6 absolute h-full w-full overflow-scroll whitespace-pre-wrap p-4 pt-2 text-sm">
          {children}
        </div>
      </div>
    </Card>
  );
}
