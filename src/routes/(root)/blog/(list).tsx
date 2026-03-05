import { Link } from "@solidjs/meta";
import { cache } from "@solidjs/router";
import type { Blog, WithContext } from "schema-dts";
import type { JSXElement } from "solid-js";

import JsonLd from "~/components/JsonLd";
import Metadata from "~/components/Metadata";
import type { BlogEntry } from "~/content/config";

const blogJsonLd: WithContext<Blog> = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "PortOne 기술 블로그",
  description:
    "핀테크 기업 포트원이 기술을 통해 결제를 혁신해나가는 과정을 이야기합니다.",
  url: "https://developers.portone.io/blog",
  publisher: {
    "@type": "Organization",
    name: "PortOne",
    logo: {
      "@type": "ImageObject",
      url: "https://developers.portone.io/opengraph.png",
    },
  },
};

export const loadLatestPosts = cache(async () => {
  "use server";

  const { blog } = await import("#content");
  return (Object.values(blog) as { slug: string; frontmatter: BlogEntry }[])
    .filter(
      (entry) =>
        !entry.frontmatter.draft ||
        import.meta.env.DEV ||
        import.meta.env.VITE_VERCEL_ENV === "preview",
    )
    .map((entry) => ({
      slug: entry.slug,
      entry: entry.frontmatter,
    }));
}, "blog/posts/latest");

export default function BlogListLayout(props: { children: JSXElement }) {
  return (
    <>
      <Metadata
        title="PortOne 기술 블로그"
        description="핀테크 기업 포트원이 기술을 통해 결제를 혁신해나가는 과정을 이야기합니다."
        ogImageSlug="blog/opengraph.png"
      />
      <JsonLd data={blogJsonLd} />
      <Link
        rel="alternate"
        type="application/rss+xml"
        title="PortOne 기술 블로그"
        href="https://developers.portone.io/blog/rss.xml"
      />
      <div class="mx-auto my-4 max-w-1148px min-h-full flex flex-col gap-10 break-keep px-5 pb-50">
        <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <h1 class="break-keep text-8 text-slate-8 font-semibold lg:text-10">
            <a href="/blog">PortOne 기술 블로그</a>
          </h1>
        </div>
        <div class="flex flex-col gap-6">{props.children}</div>
      </div>
    </>
  );
}
