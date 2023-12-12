export function lazy<T>(fn: () => Promise<T>): PromiseLike<T> {
  let p: Promise<any>;
  return {
    then(onfulfilled, onrejected) {
      return p || (p = fn().then(onfulfilled, onrejected));
    },
  };
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
