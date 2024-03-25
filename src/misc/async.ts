export function lazy<T>(fn: () => Promise<T>): PromiseLike<T> {
  let p: Promise<T> | undefined;
  return {
    then(onfulfilled, onrejected) {
      return p || (p = fn().then(onfulfilled, onrejected) as Promise<T>);
    },
  } as PromiseLike<T>;
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
