import { A } from "@solidjs/router";

import { useSidebarContext } from "~/layouts/sidebar/context";

interface Props {
  title: string;
  id: string;
  basepath: string;
}

export default function NavMenuLink(props: Props) {
  const sidebarOpen = useSidebarContext();

  return (
    <A
      class="block flex-1 px-2 py-1"
      href={`${props.basepath}/${props.id}`}
      onClick={() => {
        sidebarOpen.set(false);
      }}
    >
      {props.title}
    </A>
  );
}
