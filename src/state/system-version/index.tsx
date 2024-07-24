import { useIsRouting, useLocation, useSearchParams } from "@solidjs/router";
import {
  createContext,
  createEffect,
  createResource,
  type JSXElement,
  useContext,
} from "solid-js";
import Cookies from "universal-cookie";

import { SystemVersion } from "~/type";

import { determineServerSystemVersion } from "./determineSystemVersion";

export const defaultSystemVersion = "v2" as SystemVersion;

const SystemVersionContext = createContext({
  systemVersion: () => defaultSystemVersion,
  setSystemVersion: (_: SystemVersion) => {},
});

export const useSystemVersion = () => useContext(SystemVersionContext);

export function SystemVersionProvider(props: { children: JSXElement }) {
  const [systemVersion, { mutate: setSystemVersion }] = createResource(
    determineServerSystemVersion,
    { initialValue: defaultSystemVersion, deferStream: true },
  );
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const isRouting = useIsRouting();

  createEffect(() => {
    const v = systemVersion();
    const cookies = new Cookies(null, { path: "/" });
    cookies.set("systemVersion", v);

    void params.v; // subscribe to params
    if (
      !isRouting() &&
      [/^\/docs\//, /^\/api\//].some((regex) => regex.test(location.pathname))
    ) {
      setParams({ v });
    }
  });

  return (
    <SystemVersionContext.Provider value={{ systemVersion, setSystemVersion }}>
      {props.children}
    </SystemVersionContext.Provider>
  );
}
