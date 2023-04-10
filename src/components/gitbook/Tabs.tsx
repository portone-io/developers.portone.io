import type * as React from "react";

export interface TabsProps {
  children: React.ReactNode;
}
const Tabs: React.FC<TabsProps> = ({ children }) => {
  return <>{children}</>;
};
export default Tabs;
