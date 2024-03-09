import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
  const blog = await getCollection("blog");
  return rss({
    title: "PortOne 기술 블로그",
    description:
      "핀테크 기업 포트원이 기술을 통해 결제를 혁신해나가는 과정을 이야기합니다.",
    site: context.site!,
    items: blog
      .filter((post) => !post.data.draft)
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .slice(0, 100)
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: `/blog/posts/${post.slug}`,
      })),
  });
}
