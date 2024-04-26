import type { MiddlewareHandler } from "astro";

import { withContext } from "~/state/server-only/context";
import { parseServerSystemVersion } from "~/state/system-version/server";

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const systemVersion = parseServerSystemVersion(ctx);
  return withContext({ systemVersion, docData: null }, next);
};
