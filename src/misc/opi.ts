import { cache, redirect } from "@solidjs/router";

import { NotFoundError } from "~/components/404";

export const getOpiFullSlug = (pathname: string) => {
  if (!pathname.startsWith("/opi/")) return null;
  return pathname.replace(/^\/opi\/?/, "");
};

export const loadDoc = cache(async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") throw redirect("/opi/ko/readme", 302);
  if (!fullSlug.includes("/")) throw redirect(`/opi/${fullSlug}/readme`, 302);

  const { opi } = await import("#content");
  if (!(fullSlug in opi)) throw new NotFoundError();

  return opi[fullSlug as keyof typeof opi];
}, "opi/content");
