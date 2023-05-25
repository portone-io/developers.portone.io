export function lazy<T>(fn: () => Promise<T>): PromiseLike<T> {
  let p: Promise<any>;
  return {
    then(onfulfilled, onrejected) {
      return p || (p = fn().then(onfulfilled, onrejected));
    },
  };
}
