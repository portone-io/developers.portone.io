import { AsyncLocalStorage } from "async_hooks";

declare module "~/state/server-only/context" {
  interface ServerContext {}
}

const contextStorage = new AsyncLocalStorage<ServerContext>();
export function withContext<T>(context: ServerContext, fn: () => Promise<T>) {
  return contextStorage.run(context, fn);
}
export function overrideContext<K extends keyof ServerContext>(
  key: K,
  value: ServerContext[K],
) {
  const context = contextStorage.getStore();
  if (!context) throw new Error("Context not available");
  context[key] = value;
}
export function readContext<K extends keyof ServerContext>(key: K) {
  const context = contextStorage.getStore();
  if (!context) throw new Error("Context not available");
  return context[key];
}
