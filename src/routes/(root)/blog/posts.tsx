import {
  cache,
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import clsx from "clsx";
import { format } from "date-fns";
import { createMemo, For, type JSXElement, Show } from "solid-js";
import { MDXProvider } from "solid-mdx";
import { match, P } from "ts-pattern";

import { NotFoundError } from "~/components/404";
import PostList from "~/components/blog/PostList/PostList";
import ProfileImage from "~/components/blog/ProfileImage";
import { prose } from "~/components/blog/prose";
import TagList from "~/components/blog/TagList";
import Metadata from "~/components/Metadata";
import TableOfContents from "~/components/TableOfContents";

import { loadLatestPosts } from "./(list)";
import styles from "./posts.module.css";

const toSlug = (path: string) => path.replace(/^\/blog\/posts\//, "");
const loadPost = cache(async (slug: string) => {
  "use server";

  const { blog } = await import("#content");
  if (!(slug in blog)) throw new NotFoundError();
  return blog[slug as keyof typeof blog];
}, "blog/post");

const loadAuthor = cache(async (authorId: string) => {
  "use server";

  const { default: authors } = await import("./posts/_authors.yaml");
  if (!(authorId in authors)) return null;
  return authors[authorId];
}, "blog/author");

export const route = {
  preload: async ({ location }) => {
    void loadLatestPosts();
    const post = await loadPost(toSlug(location.pathname));
    if (post) void loadAuthor(post.frontmatter.author);
  },
} satisfies RouteDefinition;

export default function PostsLayout(props: { children: JSXElement }) {
  const location = useLocation();
  const slug = createMemo(() => toSlug(location.pathname));
  const post = createAsync(
    async () => {
      const post = await loadPost(slug());
      const author = await loadAuthor(post.frontmatter.author);
      return { ...post, author };
    },
    { deferStream: true },
  );
  const latestPosts = createAsync(() => loadLatestPosts());

  return (
    <Show when={post()}>
      {(post) => {
        const { title, description } = post().frontmatter;
        return (
          <>
            <Metadata
              title={`${title} - PortOne 기술 블로그`}
              description={description}
              ogType="article"
              ogImageSlug={`blog/posts/${slug()}.png`}
            />
            <div class="mx-auto max-w-[1150px] break-keep pb-50 [&_a]:break-keep">
              <article class="w-full flex flex-col gap-6 text-17px text-slate-7 <lg:mx-auto md:my-4">
                <div class="mx-auto max-w-[800px] w-full flex flex-col gap-3 px-4 lg:max-w-none md:px-6">
                  <a
                    href="/blog"
                    class="mb-4 w-fit flex items-center gap-1 text-sm text-slate-5 font-medium transition-colors hover:text-slate-7"
                  >
                    <i class="i-material-symbols-arrow-left-alt inline-block"></i>
                    블로그 목록
                  </a>
                  <h1 class="break-keep text-balance text-3xl font-bold leading-[1.4]">
                    {post().frontmatter.title}
                  </h1>
                  <div class="flex items-center gap-3">
                    <Show when={post().author}>
                      {(author) => (
                        <dl class="flex shrink-0 items-center gap-4 <md:py-2">
                          <div class="flex justify-evenly gap-3 whitespace-nowrap">
                            <dt class="text-lg text-slate-8 font-semibold">
                              {author().name}
                            </dt>
                            <dd class="text-lg text-slate-5">
                              {author().role}
                            </dd>
                          </div>
                        </dl>
                      )}
                    </Show>
                    <div class="h-16px w-1px bg-slate-3"></div>
                    <div class="text-lg text-slate-4">
                      {format(post().frontmatter.date, "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <div class="flex justify-between gap-9">
                  <div class="max-w-[800px] min-w-0 flex flex-col gap-3 px-4 <lg:mx-auto md:px-6">
                    <div class={clsx(styles.body, "break-keep text-slate-7")}>
                      <MDXProvider components={prose}>
                        {props.children}
                      </MDXProvider>
                    </div>
                    <div class="my-6">
                      <TagList tags={post().frontmatter.tags} />
                    </div>
                    <hr />
                    <Show when={post().author}>
                      {(author) => (
                        <div class="flex gap-5">
                          <div class="flex-shrink-0">
                            <ProfileImage>
                              <img
                                src={`https://github.com/${post().frontmatter.author}.png`}
                                alt={`Avatar image of ${author().name}`}
                                width={64}
                                height={64}
                                class="h-16 w-16 rounded-full bg-slate-2"
                              />
                            </ProfileImage>
                          </div>
                          <div class="flex flex-col gap-4.5">
                            <div class="flex items-center gap-3">
                              <div class="text-lg text-slate-7 font-medium">
                                {author().name}
                              </div>
                              <div class="text-base text-slate-4 font-medium">
                                {author().role}
                              </div>
                            </div>
                            <p>{author().bio}</p>
                            {(author().contacts?.length ?? 0) > 0 && (
                              <ul class="m-0 flex flex-row list-none gap-6 p-0 text-2xl">
                                <For each={author().contacts}>
                                  {(contact) => (
                                    <li class="text-slate-4 transition-colors hover:text-slate-5">
                                      {match(contact)
                                        .with(
                                          { github: P.string },
                                          ({ github }) => (
                                            <a
                                              href={github}
                                              aria-label={`GitHub account of ${author().name}`}
                                              class="i-simple-icons-github inline-block"
                                            />
                                          ),
                                        )
                                        .with(
                                          { twitter: P.string },
                                          ({ twitter }) => (
                                            <a
                                              href={twitter}
                                              aria-label={`Twitter account of ${author().name}`}
                                              class="i-simple-icons-x inline-block"
                                            />
                                          ),
                                        )
                                        .with(
                                          { facebook: P.string },
                                          ({ facebook }) => (
                                            <a
                                              href={facebook}
                                              aria-label={`Facebook page of ${author().name}`}
                                              class="i-simple-icons-facebook inline-block"
                                            />
                                          ),
                                        )
                                        .with(
                                          { linkedin: P.string },
                                          ({ linkedin }) => (
                                            <a
                                              href={linkedin}
                                              aria-label={`LinkedIn page of ${author().name}`}
                                              class="i-simple-icons-linkedin inline-block"
                                            />
                                          ),
                                        )
                                        .with(
                                          { medium: P.string },
                                          ({ medium }) => (
                                            <a
                                              href={medium}
                                              aria-label={`Medium blog of ${author().name}`}
                                              class="i-simple-icons-medium inline-block"
                                            />
                                          ),
                                        )
                                        .with(
                                          { hashnode: P.string },
                                          ({ hashnode }) => (
                                            <a
                                              href={hashnode}
                                              aria-label={`Hashnode blog of ${author().name}`}
                                              class="i-simple-icons-hashnode inline-block"
                                            />
                                          ),
                                        )
                                        .with(
                                          { tistory: P.string },
                                          ({ tistory }) => (
                                            <a
                                              href={tistory}
                                              aria-label={`Tistory blog of ${author().name}`}
                                              class="i-simple-icons-tistory inline-block"
                                            />
                                          ),
                                        )
                                        .exhaustive()}
                                    </li>
                                  )}
                                </For>
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </Show>
                    <hr />
                  </div>
                  <aside class="mx-4 hidden max-w-300px min-w-250px flex-shrink-0 lg:block">
                    <div class="sticky top-14 overflow-hidden py-4">
                      <div class="my-2 text-sm text-slate-8 font-medium">
                        목차
                      </div>
                      <TableOfContents
                        theme="aside"
                        headings={post().headings}
                      />
                    </div>
                  </aside>
                </div>
              </article>
              <div class="my-16 flex flex-col gap-6 px-4">
                <h2 class="text-1.375rem text-slate-5 font-semibold">
                  최신 글 보기
                </h2>
                <PostList posts={latestPosts() ?? []} />
              </div>
            </div>
          </>
        );
      }}
    </Show>
  );
}
