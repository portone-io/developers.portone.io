import { createMemo, type ParentProps } from "solid-js";

interface Props {
  style: "info" | "warning" | "success" | "danger";
}

export default function Hint(props: ParentProps<Props>) {
  const cls = createMemo(
    () =>
      `my-4 p-4 flex gap-3 rounded-sm border-l-4 bg-slate-1 ${
        props.style === "info"
          ? "border-blue-600"
          : props.style === "warning"
            ? "border-orange-7"
            : props.style === "success"
              ? "border-green-6"
              : props.style === "danger"
                ? "border-red-6"
                : ""
      }`,
  );
  const iconCls = createMemo(
    () =>
      `shrink-0 text-2xl ${
        props.style === "info"
          ? "icon-[ic--outline-info] text-blue-600"
          : props.style === "warning"
            ? "icon-[ic--outline-warning] text-orange-7"
            : props.style === "success"
              ? "icon-[ic--sharp-check-circle-outline] text-green-6"
              : props.style === "danger"
                ? "icon-[ic--outline-warning] text-red-6"
                : ""
      }`,
  );

  return (
    <div class={cls()}>
      <i class={iconCls()}></i>
      <div class="grid">{props.children}</div>
    </div>
  );
}
