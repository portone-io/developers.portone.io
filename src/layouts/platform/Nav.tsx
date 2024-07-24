import { useLocation } from "@solidjs/router";
import { createMemo } from "solid-js";

import type { Document } from "~/misc/platform";

import DocumentList from "./DocumentList";

interface Props {
  guides: Document[];
  usages: Document[];
}

export default function Nav(props: Props) {
  const location = useLocation();
  const activeSlug = createMemo(() =>
    location.pathname.replace(/^\/platform\//, ""),
  );

  return (
    <nav>
      <ul class="flex flex-col gap-1 p-2 py-4">
        <DocumentList
          documents={props.guides}
          title="서비스 가이드"
          activeSlug={activeSlug()}
        />
        <DocumentList
          documents={props.usages}
          title="사용 예시"
          activeSlug={activeSlug()}
        />
      </ul>
    </nav>
  );
}
