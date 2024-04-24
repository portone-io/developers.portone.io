import type { MiddlewareHandler } from "astro";

import {
  parseServerSystemVersion,
  withSystemVersion,
} from "./state/system-version/server";

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const systemVersion = parseServerSystemVersion(ctx);
  return withSystemVersion(systemVersion, next);
};
