import { createAsync, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";

import PostList from "~/components/blog/PostList/PostList";
import { loadLatestPosts } from "../(list)";

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
