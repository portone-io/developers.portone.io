import type * as React from "react";

export interface HintProps {
  children: React.ReactNode;
  style: "info";
}
const Hint: React.FC<HintProps> = ({ children, style = "info" }) => {
  const cls = `flex gap-3 px-4 py-2 rounded border-l-4 bg-slate-1 ${
    style === "info" ? "border-blue-600" : ""
  }`;
  const iconCls = `text-2xl ${
    style === "info" ? "i-ic-outline-info mt-2 text-blue-600" : ""
  }`;
  return (
    <div class={cls}>
      <i class={iconCls} />
      <div>{children}</div>
    </div>
  );
};
export default Hint;
