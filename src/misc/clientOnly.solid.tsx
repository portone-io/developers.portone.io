/* @jsxImportSource solid-js */

import { type JSX, createSignal, createEffect } from "solid-js";

export default function ClientOnly(props: { children: JSX.Element }) {
  const [isClient, setIsClient] = createSignal(false);

  createEffect(() => {
    Promise.resolve().then(() => setIsClient(true));
  });

  return <>{isClient() && props.children}</>;
}
