import { cache, redirect } from "@solidjs/router";
import { match } from "ts-pattern";

import { NotFoundError } from "~/components/404";

export const DocsContentName = ["opi", "sdk", "platform"] as const;
export type DocsContentName = (typeof DocsContentName)[number];

export const parseDocsFullSlug = (
  pathname: string,
): [DocsContentName, string] | null => {
  for (const contentName of DocsContentName) {
    const regex = new RegExp(`^/${contentName}/?`);
    if (pathname.startsWith(`/${contentName}`)) {
      return [contentName, pathname.replace(regex, "")];
    }
  }
  return null;
};

const loadOpiDoc = async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") throw redirect("/opi/ko/readme", 302);
  if (!fullSlug.includes("/")) throw redirect(`/opi/${fullSlug}/readme`, 302);

  const { opi } = await import("#content");
  if (!(fullSlug in opi)) throw new NotFoundError();

  return opi[fullSlug as keyof typeof opi];
};

const loadSdkDoc = async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") throw redirect("/sdk/ko/readme", 302);
  if (!fullSlug.includes("/")) throw redirect(`/sdk/${fullSlug}/readme`, 302);

  const { sdk } = await import("#content");
  if (!(fullSlug in sdk)) throw new NotFoundError();

  return sdk[fullSlug as keyof typeof sdk];
};

const loadPlatformDoc = async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") throw redirect("/platform/ko/readme", 302);
  // Redirect old URLs
  if (["guides/", "usages/"].some((old) => fullSlug.startsWith(old))) {
    throw redirect(`/platform/ko/${fullSlug}`, 302);
  }
  if (fullSlug.startsWith("ko/guides/intro")) {
    throw redirect("/platform/ko/readme", 302);
  }
  if (!fullSlug.includes("/"))
    throw redirect(`/platform/${fullSlug}/readme`, 302);

  const { platform } = await import("#content");
  if (!(fullSlug in platform)) throw new NotFoundError();

  return platform[fullSlug as keyof typeof platform];
};

export const loadDoc = cache(
  async (contentName: DocsContentName, fullSlug: string) => {
    "use server";

    return match(contentName)
      .with("opi", () => loadOpiDoc(fullSlug))
      .with("sdk", () => loadSdkDoc(fullSlug))
      .with("platform", () => loadPlatformDoc(fullSlug))
      .exhaustive();
  },
  "docs/content",
);
