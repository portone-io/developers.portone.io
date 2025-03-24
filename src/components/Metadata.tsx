import { Link, Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { createMemo, mergeProps, Show } from "solid-js";
import { match, P } from "ts-pattern";

import type { DocsEntry } from "~/content/config";

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

  const canonicalUrl = createMemo(() => {
    const url = match([
      props.docsEntry?.targetVersions,
      props.docsEntry?.versionVariants,
    ])
      .with([[...P.array("v1"), "v1"], P._], () => {
        return `https://developers.portone.io${location.pathname}?v=v1`;
      })
      .with([[...P.array("v2"), "v2"], P._], () => {
        return `https://developers.portone.io${location.pathname}?v=v2`;
      })
      .with([P._, { v2: P.string }], () => {
        return `https://developers.portone.io${location.pathname}?v=v1`;
      })
      .with([P._, { v1: P.string }], () => {
        return `https://developers.portone.io${location.pathname}?v=v2`;
      })
      .with(
        [[...P.array(P.union("v1", "v2")), P.union("v1", "v2")], P._],
        [P._, { v1: P.string, v2: P.string }],
        [undefined, undefined],
        [[], undefined],
        () => {
          return `https://developers.portone.io${location.pathname}`;
        },
      )
      .exhaustive();
    return url;
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
