import { createMemo, For, type JSX, splitProps } from "solid-js";
import type { Picture } from "vite-imagetools";

interface Props extends JSX.ImgHTMLAttributes<HTMLImageElement> {
  picture: Picture;
}

export default function Picture(props: Props) {
  const [locals, imgProps] = splitProps(props, ["picture"]);
  const sources = createMemo(() =>
    Object.entries(locals.picture.sources).map(([format, src]) => ({
      format,
      src,
    })),
  );

  return (
    <picture>
      <For each={sources()}>
        {({ format, src }) => <source type={`image/${format}`} src={src} />}
      </For>
      <img src={locals.picture.img.src} {...imgProps} />
    </picture>
  );
}
