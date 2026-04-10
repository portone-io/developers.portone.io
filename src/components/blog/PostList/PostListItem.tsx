import { createMemo, Show } from "solid-js";

import ProfileImage from "~/components/blog/ProfileImage";
import TagList from "~/components/blog/TagList";
import Picture from "~/components/Picture";
import type { BlogEntry } from "~/content/config";
import authors from "~/routes/(root)/blog/posts/_authors.yaml";

interface Props {
  slug: string;
  entry: BlogEntry;
}

export default function PostListItem(props: Props) {
  const author = createMemo(() => authors[props.entry.author]);

  return (
    <li class="flex h-fit flex-col gap-4 text-[17px]">
      <div class="grid h-full w-full grid-cols-1 grid-rows-1 overflow-hidden rounded-[12px] border">
        <a
          href={`/blog/posts/${props.slug}`}
          class="col-start-1 col-end-2 row-start-1 row-end-2 h-full w-full"
        >
          <Picture
            picture={props.entry.thumbnail}
            alt={`Thumbnail image of ${props.entry.title}`}
            class="aspect-6/4 h-full w-full bg-white object-contain text-transparent"
          />
        </a>
        <div class="col-start-1 col-end-2 row-start-1 row-end-2 m-2.5 flex self-end justify-self-start">
          <ProfileImage>
            <img
              src={`https://github.com/${props.entry.author}.png`}
              alt={`Avatar image of ${author?.name ?? props.entry.author}`}
              width={48}
              height={48}
              class="bg-slate-2 rounded-full"
            />
          </ProfileImage>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <a
          href={`/blog/posts/${props.slug}`}
          class="flex h-full flex-col justify-between gap-2"
        >
          <span class="text-slate-7 text-[19px] font-semibold">
            {props.entry.title}
            <Show when={props.entry.draft}>
              <span class="text-slate-5 text-lg leading-[1.4] font-normal">
                (Draft)
              </span>
            </Show>
          </span>
          <span class="text-slate-5">{props.entry.description}</span>
        </a>
        <TagList tags={props.entry.tags} variant="compact" />
      </div>
    </li>
  );
}
