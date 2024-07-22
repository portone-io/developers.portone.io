import clsx from "clsx";
import {
  createMemo,
  For,
  type JSX,
  splitProps,
  createResource,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import type { Picture } from "vite-imagetools";

interface Props extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  picture: Picture;
  alt: string;
}

export default function Picture(props: Props) {
  const [locals, imgProps] = splitProps(props, [
    "picture",
    "onLoad",
    "onError",
  ]);
  const sources = createMemo(() =>
    Object.entries(locals.picture.sources).map(([format, src]) => ({
      format,
      src,
    })),
  );
  const [isServerRendered] = createResource(() => isServer);

  const {
    promise: loadedPromise,
    resolve,
    reject,
  } = (() => {
    let resolve: ((value: boolean) => void) | undefined;
    let reject: ((reason?: unknown) => void) | undefined;
    return {
      promise: new Promise<boolean>((res, rej) => {
        resolve = res;
        reject = rej;
      }),
      resolve: resolve!,
      reject: reject!,
    };
  })();
  const [loaded] = createResource(async () => {
    if (isServer) return true;
    // delay a tick to make sure the picture element is removed from the body, see below
    return loadedPromise.then((v) => v);
  });

  const el = (
    <picture class={clsx(!isServerRendered() && !loaded() && "w-0 h-0")}>
      <For each={sources()}>
        {({ format, src }) => <source type={`image/${format}`} src={src} />}
      </For>
      <img
        src={locals.picture.img.src}
        {...imgProps}
        onLoad={(e) => {
          resolve(true);
          if (locals.onLoad instanceof Function) locals.onLoad(e);
        }}
        onError={(e) => {
          reject(false);
          if (locals.onError instanceof Function) locals.onError(e);
        }}
      />
    </picture>
  ) as HTMLPictureElement;

  // render as-is if initially rendered on the server
  // no hydration mismatch occurs since the value of isServerRendered() is transferred by createResource()
  if (isServerRendered()) return el;

  // mount to the body to initiate loading
  document.body.appendChild(el);
  // unmount from the body once loaded
  loadedPromise.then(() => document.body.removeChild(el));
  // render the picture element only when loaded
  // loaded() triggers suspense therefore blocks router navigation (which is performed with startTransition)
  return <Show when={loaded()}>{el}</Show>;
}
