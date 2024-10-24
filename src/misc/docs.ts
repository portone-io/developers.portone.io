import { cache, redirect } from "@solidjs/router";
import { match } from "ts-pattern";

import type { Contents } from "#content";
import { NotFoundError } from "~/components/404";

export const parseDocsFullSlug = (
  pathname: string,
): [keyof Contents, string] | null => {
  for (const [contentName, regex] of [
    ["opi", /^\/opi\/?/],
    ["sdk", /^\/sdk\/?/],
  ] as const) {
    if (pathname.startsWith(`/${contentName}/`)) {
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

export const loadDoc = cache(
  async (contentName: keyof Contents, fullSlug: string) => {
    "use server";

    return match(contentName)
      .with("opi", () => loadOpiDoc(fullSlug))
      .with("sdk", () => loadSdkDoc(fullSlug))
      .otherwise(() => {
        throw new NotFoundError();
      });
  },
  "docs/content",
);
