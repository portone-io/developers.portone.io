import { effect, signal } from "@preact/signals";
import Cookies from "universal-cookie";

import type { SystemVersion } from "~/type";

import { parseSystemVersion } from "./utils";

const cookies = new Cookies(null, { path: "/" });

export function getInitialSystemVersion() {
  const override = globalThis.document
    .querySelector(`meta[name="portone:system-version"]`)
    ?.getAttribute("content");
  const cookieItem = cookies.get<string>("systemVersion", { doNotParse: true });
  const searchParams = new URLSearchParams(location.search);
  return parseSystemVersion(override || searchParams.get("v") || cookieItem);
}
export const useSystemVersion = () => systemVersionSignal.value;

const systemVersionSignal = signal(getInitialSystemVersion());
export const updateSystemVersion = (systemVersion: SystemVersion) => {
  systemVersionSignal.value = systemVersion;
};

effect(() => {
  const systemVersion = systemVersionSignal.value;
  cookies.set("systemVersion", systemVersion);
  if (
    [/^\/docs\//, /^\/api\//].some((regex) => regex.test(location.pathname))
  ) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("v", systemVersion);
    const hash = location.hash;
    history.replaceState(null, "", `?${searchParams.toString()}${hash}`);
  }
});
