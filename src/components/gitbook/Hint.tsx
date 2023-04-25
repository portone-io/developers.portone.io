import type * as React from "react";

export interface HintProps {
  children: React.ReactNode;
  style: "info" | "warning" | "success";
}
const Hint: React.FC<HintProps> = ({ children, style = "info" }) => {
  const cls = `my-4 p-4 flex gap-3 rounded border-l-4 bg-slate-1 ${
    style === "info"
      ? "border-blue-600"
      : style === "warning"
      ? "border-orange-7"
      : style === "success"
      ? "border-green-6"
      : ""
  }`;
  const iconCls = `text-2xl ${
    style === "info"
      ? "i-ic-outline-info text-blue-600"
      : style === "warning"
      ? "i-ic-outline-warning text-orange-7"
      : style === "success"
      ? "i-ic-sharp-check-circle-outline text-green-6"
      : ""
  }`;
  return (
    <div class={cls}>
      <i class={iconCls} />
      <div>{children}</div>
    </div>
  );
};
export default Hint;
