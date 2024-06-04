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

  createEffect(() => {
    const v = systemVersion();
    const cookies = new Cookies(null, { path: "/" });
    cookies.set("systemVersion", v);
    if (
      [/^\/docs\//, /^\/api\//].some((regex) => regex.test(location.pathname))
    ) {
      const url = new URL(location.href);
      url.searchParams.set("v", v);
      history.replaceState(null, "", url);
    }
  });

  return (
    <SystemVersionContext.Provider value={{ systemVersion, setSystemVersion }}>
      {props.children}
    </SystemVersionContext.Provider>
  );
}
