import { clsx } from "clsx";
import { createSignal, type JSXElement, onMount } from "solid-js";

interface Props {
  class?: string;
  children: JSXElement;
}

export default function ProfileImage(props: Props) {
  let wrapperRef: HTMLDivElement | undefined;
  let overlayRef: HTMLDivElement | undefined;
  const [loaded, setLoaded] = createSignal(false);

  onMount(() => {
    const image = wrapperRef?.querySelector("img");
    if (image) {
      if (image.complete) {
        setLoaded(true);
      } else {
        image.addEventListener("load", () => {
          setLoaded(true);
        });
      }
    }
  });

  return (
    <div ref={wrapperRef} class={clsx("relative", props.class)}>
      {props.children}
      <div
        ref={overlayRef}
        class="absolute inset-0 block rounded-full bg-#ccc opacity-100 transition-opacity duration-0.1s ease-in-out content-empty"
        classList={{ "!opacity-0": loaded() }}
      />
    </div>
  );
}
