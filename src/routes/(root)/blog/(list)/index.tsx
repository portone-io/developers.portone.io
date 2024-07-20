import { cache, createAsync, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";

import PostList from "~/components/blog/PostList/PostList";
import type { BlogEntry } from "~/content/config";

export const loadLatestPosts = cache(async () => {
  "use server";

  const { blog } = await import("#content");
  return (Object.values(blog) as { slug: string; frontmatter: BlogEntry }[])
    .filter(
      (entry) =>
        !entry.frontmatter.draft ||
        import.meta.env.DEV ||
        import.meta.env.VERCEL_ENV === "preview",
    )
    .map((entry) => ({
      slug: entry.slug,
      entry: entry.frontmatter,
    }));
}, "blog/posts/latest");

export const route = {
  preload: () => {
    void loadLatestPosts();
  },
} satisfies RouteDefinition;

export default function LatestPostsList() {
  const posts = createAsync(() => loadLatestPosts());

  return (
    <Show when={posts()}>
      {(posts) => (
        <>
          <h2 class="text-1.375rem text-slate-5 font-semibold">최신 글 보기</h2>
          <PostList posts={posts()} />
        </>
      )}
    </Show>
  );
}
