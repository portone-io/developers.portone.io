import {
  createContext,
  createSignal,
  type JSXElement,
  useContext,
} from "solid-js";

const SidebarContext = createContext<{
  get: () => boolean;
  set: (value: boolean) => void;
}>({
  get: () => false,
  set: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export default function SidebarProvider(props: { children: JSXElement }) {
  const [get, set] = createSignal(false);

  return (
    <SidebarContext.Provider value={{ get, set }}>
      {props.children}
    </SidebarContext.Provider>
  );
}
