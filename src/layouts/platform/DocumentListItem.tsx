import { createMemo } from "solid-js";

import { JustLink } from "~/layouts/sidebar/LeftSidebarItem";
import type { Document } from "~/misc/platform";

interface Props {
  document: Document;
  activeSlug: string | undefined;
}

export default function DocumentListItem(props: Props) {
  const documentTitle = () => props.document.entry.title;

  const isActive = createMemo(() =>
    props.activeSlug ? props.document.slug === props.activeSlug : false,
  );
  const href = () => `/platform/${props.document.slug}`;

  return (
    <li>
      <JustLink
        title={documentTitle()}
        href={href()}
        isActive={isActive()}
        event={{
          name: "Platform_Guide_Click",
          props: { slug: props.document.slug },
        }}
      />
    </li>
  );
}
