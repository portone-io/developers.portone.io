import {NotFoundError} from "~/components/404.tsx";
import {cache, createAsync, Navigate, useParams} from "@solidjs/router";

const loadRedirection = cache(async (slug: string) => {
  "use server";

  const { default: redirYaml } = await import(
    "~/routes/(root)/docs/_redir.yaml"
    );
  const redir = redirYaml.find(({ old }) => old === slug);
  if (!redir) return;
  return `/${redir.new}`
}, "docs/redirection");

export default function Redirect() {
  const params = useParams();
  const redirection = createAsync(async () => {
    const slug = params.redirect
    if (!slug) return;
    return await loadRedirection(`/${slug}`);
  });

  const destination = redirection()

  if (!destination) throw new NotFoundError();
  else return <Navigate href={destination} />


}
