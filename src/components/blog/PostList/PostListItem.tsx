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
    <li class="h-fit flex flex-col gap-4 text-17px">
      <div class="grid grid-cols-1 grid-rows-1 h-full w-full overflow-hidden border rounded-12px">
        <a
          href={`/blog/posts/${props.slug}`}
          class="col-start-1 row-start-1 col-end-2 row-end-2 h-full w-full"
        >
          <Picture
            picture={props.entry.thumbnail}
            alt={`Thumbnail image of ${props.entry.title}`}
            class="aspect-6/4 h-full w-full bg-white object-contain text-transparent"
          />
        </a>
        <div class="col-start-1 row-start-1 col-end-2 row-end-2 m-2.5 flex self-end justify-self-start">
          <ProfileImage>
            <img
              src={`https://github.com/${props.entry.author}.png`}
              alt={`Avatar image of ${author?.name ?? props.entry.author}`}
              width={48}
              height={48}
              class="rounded-full bg-slate-2"
            />
          </ProfileImage>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <a
          href={`/blog/posts/${props.slug}`}
          class="h-full flex flex-col justify-between gap-2"
        >
          <span class="text-19px text-slate-7 font-semibold">
            {props.entry.title}
            <Show when={props.entry.draft}>
              <span class="text-lg text-slate-5 font-normal leading-[1.4]">
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
