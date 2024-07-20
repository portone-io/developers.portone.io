import { Link, Meta, Title } from "@solidjs/meta";
import type { JSXElement } from "solid-js";

export default function BlogListLayout(props: { children: JSXElement }) {
  return (
    <>
      <Title>PortOne 기술 블로그</Title>
      <Meta
        name="description"
        content="핀테크 기업 포트원이 기술을 통해 결제를 혁신해나가는 과정을 이야기합니다."
      />
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
