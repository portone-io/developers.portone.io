import { useIsRouting, useLocation, useSearchParams } from "@solidjs/router";
import {
  createContext,
  createEffect,
  createResource,
  type JSXElement,
  untrack,
  useContext,
} from "solid-js";
import Cookies from "universal-cookie";

import { SystemVersion } from "~/type";

import { defaultSystemVersion } from "./constants";
import { determineServerSystemVersion } from "./determineSystemVersion";
import {
  resolveSystemVersion,
  shouldSyncSystemVersionQuery,
} from "./resolveSystemVersion";

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
    const pathname = location.pathname;
    const queryVersion = params.v;
    const fallbackVersion = untrack(systemVersion);

    const resolved = resolveSystemVersion({
      pathname,
      queryVersion,
      fallbackVersion,
    });
    if (resolved !== untrack(systemVersion)) {
      setSystemVersion(resolved);
    }
  });

  createEffect(() => {
    const pathname = location.pathname;
    const v = systemVersion();
    const cookies = new Cookies(null, { path: "/" });
    cookies.set("systemVersion", v);

    if (
      !isRouting() &&
      shouldSyncSystemVersionQuery(pathname) &&
      params.v !== v
    ) {
      setParams({ v }, { replace: true });
    }
  });

  return (
    <SystemVersionContext.Provider value={{ systemVersion, setSystemVersion }}>
      {props.children}
    </SystemVersionContext.Provider>
  );
}
