import type { SystemVersion } from "~/type";

export declare const getInitialSystemVersion: () => SystemVersion;
export declare const useSystemVersion: () => SystemVersion;
/**
 * No-op on the server.
 */
export declare const updateSystemVersion: (
  systemVersion: SystemVersion,
) => void;

throw new Error(
  "This file should be replaced by the actual implementation of the interface per environment",
);
