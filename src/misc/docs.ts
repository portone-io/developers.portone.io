import { query, redirect } from "@solidjs/router";
import { match } from "ts-pattern";

export const DocsContentName = [
  "opi",
  "sdk",
  "platform",
  "release-notes",
] as const;
export type DocsContentName = (typeof DocsContentName)[number];
type ContentModule = typeof import("#content");
type DocsCollectionMap = {
  opi: ContentModule["opi"];
  sdk: ContentModule["sdk"];
  platform: ContentModule["platform"];
  "release-notes": ContentModule["releaseNotes"];
};

export type LoadedDocByContentName<T extends DocsContentName> =
  T extends DocsContentName
    ? DocsCollectionMap[T][keyof DocsCollectionMap[T]] | undefined
    : never;

export const parseDocsFullSlug = (
  pathname: string,
): [contentName: DocsContentName, fullSlug: string] | null => {
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

  if (fullSlug === "") return redirect("/opi/ko/readme", 302);
  if (!fullSlug.includes("/")) return redirect(`/opi/${fullSlug}/readme`, 302);

  const { opi } = await import("#content");
  if (!(fullSlug in opi)) return;

  return opi[fullSlug as keyof typeof opi];
};

const loadSdkDoc = async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") return redirect("/sdk/ko/readme", 302);
  if (!fullSlug.includes("/")) return redirect(`/sdk/${fullSlug}/readme`, 302);

  const { sdk } = await import("#content");
  if (!(fullSlug in sdk)) return;

  return sdk[fullSlug as keyof typeof sdk];
};

const loadReleaseNote = async (fullSlug: string) => {
  "use server";

  const { releaseNotes } = await import("#content");
  if (!(fullSlug in releaseNotes)) return;

  return releaseNotes[fullSlug as keyof typeof releaseNotes];
};

const loadPlatformDoc = async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") return redirect("/platform/ko/readme", 302);
  // Redirect old URLs
  if (["guides/", "usages/"].some((old) => fullSlug.startsWith(old))) {
    return redirect(`/platform/ko/${fullSlug}`, 302);
  }
  if (fullSlug.startsWith("ko/guides/intro")) {
    return redirect("/platform/ko/readme", 302);
  }
  if (!fullSlug.includes("/"))
    return redirect(`/platform/${fullSlug}/readme`, 302);

  const { platform } = await import("#content");
  if (!(fullSlug in platform)) return;

  return platform[fullSlug as keyof typeof platform];
};

const loadDocQuery = query(
  async (contentName: DocsContentName, fullSlug: string) => {
    "use server";

    return match(contentName)
      .with("opi", () => loadOpiDoc(fullSlug))
      .with("sdk", () => loadSdkDoc(fullSlug))
      .with("platform", () => loadPlatformDoc(fullSlug))
      .with("release-notes", () => loadReleaseNote(fullSlug))
      .otherwise(() => undefined);
  },
  "docs/content",
);

type LoadDoc = {
  (
    contentName: "opi",
    fullSlug: string,
  ): Promise<LoadedDocByContentName<"opi">>;
  (
    contentName: "sdk",
    fullSlug: string,
  ): Promise<LoadedDocByContentName<"sdk">>;
  (
    contentName: "platform",
    fullSlug: string,
  ): Promise<LoadedDocByContentName<"platform">>;
  (
    contentName: "release-notes",
    fullSlug: string,
  ): Promise<LoadedDocByContentName<"release-notes">>;
  (
    contentName: DocsContentName,
    fullSlug: string,
  ): Promise<LoadedDocByContentName<DocsContentName>>;
  keyFor: typeof loadDocQuery.keyFor;
  key: typeof loadDocQuery.key;
};

export const loadDoc = Object.assign(
  (contentName: DocsContentName, fullSlug: string) =>
    loadDocQuery(contentName, fullSlug),
  {
    keyFor: loadDocQuery.keyFor,
    key: loadDocQuery.key,
  },
) as LoadDoc;
