"use server";

import { getCookie, getQuery } from "@solidjs/start/http";
import { getRequestEvent } from "solid-js/web";

import type { SystemVersion } from "~/type";

import { defaultSystemVersion } from ".";

const parseSystemVersion = (value: unknown) => {
  return ["v1", "v2"].includes(value as string)
    ? (value as SystemVersion)
    : defaultSystemVersion;
};

export const determineServerSystemVersion =
  // eslint-disable-next-line @typescript-eslint/require-await
  async (): Promise<SystemVersion> => {
    const event = getRequestEvent();
    if (!event) return defaultSystemVersion;
    const { v: searchValue } = getQuery(event.nativeEvent);
    const cookieValue = getCookie(event.nativeEvent, "systemVersion");
    return parseSystemVersion(searchValue || cookieValue);
  };
