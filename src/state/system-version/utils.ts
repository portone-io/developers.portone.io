import type { SystemVersion } from "~/type";

export const parseSystemVersion = (value: unknown) => {
  return ["v1", "v2"].includes(value as string)
    ? (value as SystemVersion)
    : "v1"; // default
};
