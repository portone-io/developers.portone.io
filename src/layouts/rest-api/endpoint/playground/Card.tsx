import clsx from "clsx";
import { splitProps, type JSX, type JSXElement } from "solid-js";

export interface CardProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> {
	title?: JSXElement;
  titleClass?: string;
}
export default function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ["title", "titleClass", "class", "children"]);
  return (
    <div
      {...rest}
      class={clsx(
        "border-slate-2 flex flex-col rounded-lg border",
        local.class,
      )}
    >
      <div
        class={clsx(
          "border-slate-2 flex h-10 items-center justify-between border-b px-4 font-bold",
          local.titleClass,
        )}
      >
        {local.title}
      </div>
      {local.children}
    </div>
  );
}
