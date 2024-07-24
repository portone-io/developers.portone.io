import { For, Show } from "solid-js";

import type { BlogEntry } from "~/content/config";

import PostListItem from "./PostListItem";

interface Props {
  posts: { slug: string; entry: BlogEntry }[];
}

export default function PostList(props: Props) {
  return (
    <Show
      when={props.posts.length > 0}
      fallback={<div>게시글이 없습니다.</div>}
    >
      <ul class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-10 text-left">
        <For
          each={props.posts.toSorted(
            (a, b) => b.entry.date.getTime() - a.entry.date.getTime(),
          )}
        >
          {(post) => <PostListItem entry={post.entry} slug={post.slug} />}
        </For>
      </ul>
    </Show>
  );
}
