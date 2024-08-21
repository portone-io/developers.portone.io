import "~/components/prose.css";

import { createAsync } from "@solidjs/router";

import { loadChangelog } from "./loadChangelog";

export default function SDKChangelog() {
  const html = createAsync(() => loadChangelog());

  return <div class="prose-marker" innerHTML={html()} />;
}
