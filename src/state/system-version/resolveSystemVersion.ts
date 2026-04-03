import { versionMap } from "~/content/__generated__/client/versionMap";
import {
  type SystemVersion,
  SystemVersion as SystemVersionSchema,
} from "~/type";

import { defaultSystemVersion } from "./constants";

const syncedQueryPathPatterns = [
  /^\/docs\//,
  /^\/api\//,
  /^\/opi\//,
  /^\/sdk\//,
];

const parseSystemVersion = (value: unknown): SystemVersion | undefined => {
  return SystemVersionSchema.safeParse(value).data;
};

const getExplicitApiSystemVersion = (
  pathname: string,
): SystemVersion | undefined => {
  if (pathname.startsWith("/api/rest-v1")) return "v1";
  if (pathname.startsWith("/api/rest-v2")) return "v2";
  return undefined;
};

const getExplicitDocsSystemVersion = (
  pathname: string,
): SystemVersion | undefined => {
  const normalizedPathname = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  const versions = versionMap[normalizedPathname];
  if (versions?.length === 1) return versions[0];
  return undefined;
};

export const getExplicitSystemVersion = (
  pathname: string,
): SystemVersion | undefined => {
  return (
    getExplicitApiSystemVersion(pathname) ??
    getExplicitDocsSystemVersion(pathname)
  );
};

export const resolveSystemVersion = (props: {
  pathname: string;
  queryVersion?: unknown;
  fallbackVersion?: unknown;
}): SystemVersion => {
  const explicitVersion = getExplicitSystemVersion(props.pathname);
  return (
    explicitVersion ??
    parseSystemVersion(props.queryVersion) ??
    parseSystemVersion(props.fallbackVersion) ??
    defaultSystemVersion
  );
};

export const shouldSyncSystemVersionQuery = (pathname: string) => {
  return syncedQueryPathPatterns.some((pattern) => pattern.test(pathname));
};
