import redirYaml from "~/content/docs/_redir.yaml";

export const getRedirection = (slug: string) => {
  const redir = redirYaml.find(({ old }) => old === slug);
  if (!redir) return;
  const target = redir.new.startsWith("/") ? `/docs${redir.new}` : redir.new;
  return new Response(null, {
    status: 301,
    headers: { Location: target },
  });
};
