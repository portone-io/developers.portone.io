import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import { unified } from "unified";

export function toHtml(md: string): string {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .processSync(md)
    .toString();
}
