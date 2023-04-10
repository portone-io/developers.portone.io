import type * as React from "react";

export interface TabProps {
  children: React.ReactNode;
}
const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};
export default Tab;
