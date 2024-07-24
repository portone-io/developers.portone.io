import { Show } from "solid-js";

interface Props {
  src: string;
  filename: string;
  caption?: string;
  captionInside?: string;
}

export default function File(props: Props) {
  return (
    <div>
      <a href={props.src} download={props.filename}>
        <div class="m-4 flex items-center gap-4 border rounded bg-white p-4 transition-transform hover:translate-y-[-2px] hover:text-orange-5 hover:drop-shadow-[0_12px_13px_rgba(0,0,0,0.02)]">
          <i class="i-ic-baseline-download text-2xl" role="img"></i>
          {props.captionInside ?? props.filename}
        </div>
      </a>
      <Show when={props.caption}>
        <div>{props.caption}</div>
      </Show>
    </div>
  );
}
