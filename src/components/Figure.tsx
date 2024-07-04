import { Show } from "solid-js";
import type { Picture as PictureDef } from "vite-imagetools";

import Picture from "./Picture";

interface Props {
  src: string | PictureDef;
  caption?: string;
  width?: string | number;
}

export default function Figure(props: Props) {
  return (
    <figure class="my-4 flex flex-col items-center gap-2">
      {typeof props.src === "string" ? (
        <img
          class="border"
          src={props.src}
          alt={props.caption}
          width={props.width}
        />
      ) : (
        <Picture
          picture={props.src}
          alt={props.caption ?? ""}
          width={
            typeof props.width === "number"
              ? props.width
              : props.width != null
                ? Number(props.width)
                : undefined
          }
        />
      )}
      <Show when={props.caption}>
        <figcaption class="text-sm text-slate-5">{props.caption}</figcaption>
      </Show>
    </figure>
  );
}
