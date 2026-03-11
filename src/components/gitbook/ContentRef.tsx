import { A } from "@solidjs/router";
import { Show } from "solid-js";

import { titleMap } from "#titleMap";

interface Props {
  slug: string;
}

export default function ContentRef(props: Props) {
  const title = () => titleMap[props.slug];

  return (
    <A class="m-4" href={props.slug}>
      <div class="flex items-center justify-between gap-4 border rounded bg-white p-4 transition-transform hover:translate-y-[-2px] hover:text-orange-5 hover:drop-shadow-[0_12px_13px_rgba(0,0,0,0.02)]">
        <Show when={title()} fallback={<span>{props.slug}</span>}>
          {(title) => <span>{title()}</span>}
        </Show>
        <i class="i-ic-baseline-chevron-right inline-block text-2xl" />
      </div>
    </A>
  );
}
