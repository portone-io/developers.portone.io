import { Signal } from "@preact/signals";

export const get = <T>(value: T | Signal<T>): T =>
  value instanceof Signal ? value.value : value;
