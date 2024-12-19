import {
  cache,
  createAsync,
  type RouteDefinition,
  useParams,
} from "@solidjs/router";
import { createMemo, Show } from "solid-js";

import PostList from "~/components/blog/PostList/PostList";
import type { BlogEntry } from "~/content/config";

const loadPosts = cache(async (tag: string) => {
  "use server";

  const { blog } = await import("#content");
  return (Object.values(blog) as { slug: string; frontmatter: BlogEntry }[])
    .filter(
      (entry) =>
        entry.frontmatter.tags.includes(tag) &&
        (!entry.frontmatter.draft ||
          import.meta.env.DEV ||
          import.meta.env.VITE_VERCEL_ENV === "preview"),
    )
    .map((entry) => ({
      slug: entry.slug,
      entry: entry.frontmatter,
    }));
}, "blog/posts/tag");

export const route = {
  preload: ({ params }) => {
    const tag = params.tag;
    if (tag) void loadPosts(decodeURIComponent(tag));
  },
} satisfies RouteDefinition;

export default function LatestPostsList() {
  const params = useParams<{ tag: string }>();
  const tag = createMemo(() => decodeURIComponent(params.tag));
  const posts = createAsync(() => loadPosts(tag()));

  return (
    <Show when={posts()}>
      {(posts) => (
        <>
          <h2 class="text-1.375rem text-slate-5 font-semibold">{tag()}</h2>
          <PostList posts={posts()} />
        </>
      )}
    </Show>
  );
}
