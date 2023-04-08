import type * as React from "react";

export interface HintProps {
  children: React.ReactNode;
}
const Hint: React.FC<HintProps> = ({ children }) => {
  return <>{children}</>;
};
export default Hint;
