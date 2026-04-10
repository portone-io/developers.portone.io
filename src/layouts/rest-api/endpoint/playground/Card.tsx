import clsx from "clsx";
import { type JSX, type JSXElement, splitProps } from "solid-js";

export interface CardProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: JSXElement;
  titleClass?: string;
}
export default function Card(props: CardProps) {
  const [local, rest] = splitProps(props, [
    "title",
    "titleClass",
    "class",
    "children",
  ]);
  return (
    <div
      {...rest}
      class={clsx(
        "flex flex-col border border-slate-2 rounded-lg",
        local.class,
      )}
    >
      <div
        class={clsx(
          "h-10 flex items-center justify-between border-b border-slate-2 px-4 font-bold",
          local.titleClass,
        )}
      >
        {local.title}
      </div>
      {local.children}
    </div>
  );
}
