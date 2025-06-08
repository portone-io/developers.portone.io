import { Link, Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { createMemo, mergeProps, Show } from "solid-js";
import { match, P } from "ts-pattern";

import type { DocsEntry } from "~/content/config";
import { useSystemVersion } from "~/state/system-version";
import type { SystemVersion } from "~/type";

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

  const createVersionUrl = (version?: SystemVersion) => {
    return version
      ? `https://developers.portone.io${location.pathname}?v=${version}`
      : `https://developers.portone.io${location.pathname}`;
  };

  const createVersionVariantUrl = (version: string, path: string) => {
    const isAbsolutePath = path.startsWith("/");

    let resultPath: string;

    if (isAbsolutePath) {
      resultPath = path;
    } else {
      const currentPathSegments = location.pathname.split("/").filter(Boolean);
      currentPathSegments.pop();

      const relativeSegments = path.split("/").filter(Boolean);
      const resultSegments = [...currentPathSegments];

      for (const segment of relativeSegments) {
        if (segment === "..") {
          resultSegments.pop();
        } else if (segment !== ".") {
          resultSegments.push(segment);
        }
      }

      resultPath = `/${resultSegments.join("/")}`;
    }

    return `https://developers.portone.io${resultPath}?v=${version}`;
  };

  const canonicalVersion = createMemo<SystemVersion | undefined>(() => {
    const url = match([
      props.docsEntry?.targetVersions,
      props.docsEntry?.versionVariants,
    ])
      .with([P.array("v1"), P._], () => {
        return "v1" as const;
      })
      .with([P.array("v2"), P._], () => {
        return "v2" as const;
      })
      .with([P._, { v2: P.string, v1: P.nullish }], () => {
        return "v1" as const;
      })
      .with([P._, { v1: P.string, v2: P.nullish }], () => {
        return "v2" as const;
      })
      .with(
        [P.array(P.union("v1", "v2")), P._],
        [P._, { v1: P.string, v2: P.string }],
        () => (systemVersion() ? systemVersion() : undefined),
      )
      .otherwise(() => undefined);
    return url;
  });
  const canonicalUrl = createMemo(() => {
    return createVersionUrl(canonicalVersion());
  });

  const alternateUrl = createMemo<string | undefined>(() => {
    return match([
      canonicalVersion(),
      props.docsEntry?.targetVersions,
      props.docsEntry?.versionVariants,
    ])
      .with(
        ["v1", P.array(), P._],
        ([_, targetVersions]) => targetVersions.includes("v2"),
        () => createVersionUrl("v2"),
      )
      .with(
        ["v2", P.array(), P._],
        ([_, targetVersions]) => targetVersions.includes("v1"),
        () => createVersionUrl("v1"),
      )
      .with(["v1", P._, { v2: P.select(P.string) }], (slug) => {
        return createVersionVariantUrl("v2", slug);
      })
      .with(["v2", P._, { v1: P.select(P.string) }], (slug) => {
        return createVersionVariantUrl("v1", slug);
      })
      .otherwise(() => undefined);
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
      <Show when={alternateUrl()}>
        <Link rel="alternate" href={alternateUrl()} />
      </Show>
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
