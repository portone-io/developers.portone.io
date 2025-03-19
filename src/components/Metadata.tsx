import { Link, Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { createMemo, mergeProps, Show } from "solid-js";

import type { DocsEntry } from "~/content/config";
import { useSystemVersion } from "~/state/system-version";

interface Props {
  title: string;
  description?: string;
  ogType?: "article" | "website";
  ogImageSlug?: string;
  docsEntry?: DocsEntry;
}

export default function Metadata(_props: Props) {
  const props = mergeProps(
    { type: "website", imageSlug: "opengraph.png" },
    _props,
  );
  const location = useLocation();
  const { systemVersion } = useSystemVersion();

  const canonicalUrl = createMemo(() => {
    return `https://developers.portone.io/${location.pathname}${
      // 버전별로 다른 내용을 가질 수 있다고 명시된 페이지인 경우,
      // 검색엔진이 별도로 인덱싱할 수 있도록 ?v= 추가
      (props.docsEntry?.targetVersions?.length ?? 0) > 1
        ? `?v=${systemVersion()}`
        : ""
    }`;
  });

  return (
    <>
      <Title>{props.title}</Title>
      <Meta property="og:title" content={props.title} />
      <Show when={props.description}>
        <Meta name="description" content={props.description} />
        <Meta property="og:description" content={props.description} />
      </Show>
      <Link rel="canonical" href={canonicalUrl()} />
      <Meta property="og:type" content={props.ogType} />
      <Meta
        property="og:url"
        content={`https://developers.portone.io/${location.pathname}`}
      />
      <Meta
        property="og:image"
        content={`https://developers.portone.io/${props.ogImageSlug}`}
      />
      <Meta name="twitter:card" content="summary_large_image" />
      <Show when={location.pathname !== "/"}>
        <Link
          rel="alternate"
          type="text/markdown"
          href={`https://developers.portone.io/llms${location.pathname}/llms.txt`}
        />
      </Show>
      <Link
        rel="alternate"
        type="text/markdown"
        href="https://developers.portone.io/llms-full.txt"
        title="Full content in Markdown format"
      />
      <Link
        rel="alternate"
        type="text/markdown"
        href="https://developers.portone.io/llms-small.txt"
        title="Summary content in Markdown format"
      />
      <Link
        rel="alternate"
        type="text/markdown"
        href="https://developers.portone.io/llms.txt"
        title="LLMs.txt standard format"
      />
    </>
  );
}
