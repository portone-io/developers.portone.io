import { cache, redirect } from "@solidjs/router";

import { NotFoundError } from "~/components/404";

export const getFullSlug = (pathname: string) => {
  if (!pathname.startsWith("/docs/")) return null;
  return pathname.replace(/^\/docs\/?/, "");
};

export const loadRedirection = cache(async (slug: string) => {
  "use server";

  const { default: redirYaml } = await import(
    "~/routes/(root)/docs/_redir.yaml"
  );
  const redir = redirYaml.find(({ old }) => old === slug);
  if (!redir) return;
  return redir.new.startsWith("/") ? `/docs${redir.new}` : redir.new;
}, "docs/redirection");

export const loadDoc = cache(async (fullSlug: string) => {
  "use server";

  if (fullSlug === "") throw redirect("/docs/ko/readme", 302);
  if (!fullSlug.includes("/")) throw redirect(`/docs/${fullSlug}/readme`, 302);

  const { docs } = await import("#content");
  const redirection = await loadRedirection(`/${fullSlug}`);
  if (redirection) throw redirect(redirection, 301);
  if (!(fullSlug in docs)) throw new NotFoundError();

  return docs[fullSlug as keyof typeof docs];
}, "docs/content");
