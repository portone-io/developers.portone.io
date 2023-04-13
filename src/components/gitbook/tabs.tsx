/** @jsxImportSource solid-js */
import type { ParentComponent, Signal } from "solid-js";
import { createContext, createSignal, useContext } from "solid-js";

const TabContext = createContext<Signal<string>>();

export interface TabsProps {}
export const Tabs: ParentComponent<TabsProps> = ({ children }) => {
  const tabSignal = createSignal("test");
  return (
    <TabContext.Provider value={tabSignal}>{children}</TabContext.Provider>
  );
};

export interface TabProps {
  title: string;
}
export const Tab: ParentComponent<TabProps> = ({ children }) => {
  const tabSignal = useContext(TabContext);
  return tabSignal?.[0]() || children;
};
