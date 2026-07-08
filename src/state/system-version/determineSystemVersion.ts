"use server";

import { getCookie, getQuery } from "@solidjs/start/http";
import { getRequestEvent } from "solid-js/web";

import type { SystemVersion } from "~/type";

import { defaultSystemVersion } from "./constants";
import { resolveSystemVersion } from "./resolveSystemVersion";

export const determineServerSystemVersion = (): SystemVersion => {
  const event = getRequestEvent();
  if (!event) return defaultSystemVersion;
  const { v: searchValue } = getQuery(event.nativeEvent);
  const cookieValue = getCookie(event.nativeEvent, "systemVersion");
  const pathname = new URL(event.request.url).pathname;

  return resolveSystemVersion({
    pathname,
    queryVersion: searchValue,
    fallbackVersion: cookieValue,
  });
};
