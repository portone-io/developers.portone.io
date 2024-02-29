import clsx from "clsx";
import type React from "preact/compat";
import type { HTMLAttributes } from "preact/compat";

import { get } from "~/misc/get";

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  titleClass?: string;
}
export default function Card({ title, titleClass, ...props }: CardProps) {
  return (
    <div
      {...props}
      class={clsx(
        "border-slate-2 flex flex-col rounded-lg border",
        get(props.class),
        get(props.className),
      )}
    >
      <div
        class={clsx(
          "border-slate-2 flex h-10 items-center justify-between border-b px-4 font-bold",
          titleClass,
        )}
      >
        {title}
      </div>
      {props.children}
    </div>
  );
}
