import type React from "preact/compat";

import Card from "../Card";

export interface ErrProps {
  children: React.ReactNode;
}
export default function Err({ children }: ErrProps) {
  return (
    <Card titleClass="bg-slate-1" title="Error">
      <div class="relative flex-1">
        <div class="absolute h-full w-full overflow-scroll whitespace-pre-wrap p-4 pt-2 text-sm text-red-6">
          {children}
        </div>
      </div>
    </Card>
  );
}
