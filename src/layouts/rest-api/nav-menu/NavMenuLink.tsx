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
        const el = document.getElementById(props.id);
        const heading = el?.querySelector("h2, h3, h4, h5, h6");
        requestAnimationFrame(() =>
          heading?.scrollIntoView({ behavior: "smooth" }),
        );
      }}
    >
      {props.title}
    </A>
  );
}
