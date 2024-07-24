/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { XMLBuilder } from "fast-xml-parser";

import { blog } from "#content";
import type { BlogEntry } from "~/content/config";

export function GET() {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root: any = { "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" } };
  root.rss = { "@_version": "2.0" };
  root.rss.channel = {
    title: "PortOne 기술 블로그",
    description:
      "핀테크 기업 포트원이 기술을 통해 결제를 혁신해나가는 과정을 이야기합니다.",
    link: "https://developers.portone.io/",
    item: Object.values(blog)
      .filter((entry) => !(entry.frontmatter as BlogEntry).draft)
      .sort(
        (a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime(),
      )
      .slice(0, 100)
      .map((entry) => {
        const link = `https://developers.portone.io/blog/posts/${entry.slug}/`;
        return {
          title: entry.frontmatter.title,
          pubDate: entry.frontmatter.date.toUTCString(),
          description: entry.frontmatter.description,
          link,
          guid: { "#text": link, "@_isPermaLink": "true" },
        };
      }),
  };

  return new Response(builder.build(root) as string, {
    headers: { "Content-Type": "application/xml" },
  });
}
