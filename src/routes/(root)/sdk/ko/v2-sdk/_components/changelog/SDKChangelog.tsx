import "~/components/prose.css";

import { createAsync } from "@solidjs/router";
import { query } from "@solidjs/router";
import { loadChangelog as loadChangelogFromServer } from "./loadChangelog";

const loadChangelog = query(loadChangelogFromServer, "docs/v2-payments/v2-sdk/changelog")

export default function SDKChangelog() {
  const html = createAsync(() => loadChangelog());

  return <div class="prose-marker" innerHTML={html()} />;
}
