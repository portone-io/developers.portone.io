import { createAsync, useLocation } from "@solidjs/router";
import {
  createMemo,
  createSignal,
  Match,
  type ParentProps,
  Show,
  Switch,
} from "solid-js";
import { MDXProvider } from "solid-mdx";

import { NotFoundError } from "~/components/404";
import Metadata from "~/components/Metadata";
import { prose } from "~/components/prose";
import type { DocsEntry } from "~/content/config";
import DocsNavMenu from "~/layouts/sidebar/DocsNavMenu";
import RightSidebar from "~/layouts/sidebar/RightSidebar";
import { loadDoc, parseDocsFullSlug } from "~/misc/docs";
import { getInteractiveDocs } from "~/misc/interactiveDocs";
import { InteractiveDocsProvider } from "~/state/interactive-docs";
import { PaymentGatewayProvider } from "~/state/payment-gateway";
import { Lang, PaymentGateway } from "~/type";

import { InteractiveDocs } from "./InteractiveDocs";

const loadInteractiveDocs = async (pathname: string) => {
  const parsedFullSlug = parseDocsFullSlug(pathname);
  if (!parsedFullSlug) return;
  const [contentName, fullSlug] = parsedFullSlug;
  return getInteractiveDocs(contentName, fullSlug);
};

export function Docs(props: ParentProps) {
  const location = useLocation();
  const parsedFullSlug = createMemo(() => {
    const parsedFullSlug = parseDocsFullSlug(location.pathname);
    if (!parsedFullSlug) throw new NotFoundError();
    return parsedFullSlug;
  });
  const fullSlug = createMemo(() => parsedFullSlug()[1]);
  const contentName = createMemo(() => parsedFullSlug()[0]);
  const params = createMemo(() => {
    const parts = fullSlug().split("/");
    const lang = Lang.safeParse(parts[0]).data;
    if (!lang) return null;
    const slug = parts.slice(1).join("/");
    return { lang, slug };
  });
  const doc = createAsync(() => loadDoc(contentName(), fullSlug()), {
    deferStream: true,
  });
  const frontmatter = createMemo(() => doc()?.frontmatter as DocsEntry);

  const interactiveDocs = createAsync(
    () => loadInteractiveDocs(location.pathname),
    {
      deferStream: true,
    },
  );

  return (
    <div class="flex">
      <Show when={params()}>
        {(params) => (
          <>
            <Show when={frontmatter()}>
              {(frontmatter) => {
                const initialPaymentGateway = createMemo(() => {
                  if (interactiveDocs()?.fallbackPg) {
                    return interactiveDocs()!.fallbackPg;
                  }
                  const targetPg = frontmatter().targetPg;
                  if (targetPg && targetPg !== "dynamic") {
                    return targetPg;
                  }
                  return "all";
                });
                const [paymentGateway, setPaymentGateway] = createSignal<
                  PaymentGateway | "all"
                >(initialPaymentGateway());
                return (
                  <PaymentGatewayProvider
                    paymentGateway={paymentGateway}
                    setPaymentGateway={setPaymentGateway}
                  >
                    <DocsNavMenu
                      docData={doc()?.frontmatter as DocsEntry}
                      nav={contentName()}
                      lang={params().lang}
                      slug={params().slug}
                    />
                    <Metadata
                      title={frontmatter().title}
                      description={frontmatter().description}
                      ogType="article"
                      ogImageSlug={`${contentName()}/${params().lang}/${params().slug}.png`}
                      docsEntry={frontmatter()}
                    />
                    <Switch
                      fallback={
                        <DefaultLayout
                          frontmatter={frontmatter()}
                          params={params()}
                          doc={doc()}
                        >
                          {props.children}
                        </DefaultLayout>
                      }
                    >
                      <Match
                        when={frontmatter().customLayout === "InteractiveDocs"}
                      >
                        <InteractiveDocsProvider initial={interactiveDocs()}>
                          <InteractiveDocs
                            frontmatter={frontmatter()}
                            params={params()}
                            doc={doc()}
                          >
                            {props.children}
                          </InteractiveDocs>
                        </InteractiveDocsProvider>
                      </Match>
                    </Switch>
                  </PaymentGatewayProvider>
                );
              }}
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}

const DefaultLayout = (
  props: ParentProps<{
    frontmatter: DocsEntry;
    params: { lang: Lang; slug: string };
    doc: Awaited<ReturnType<typeof loadDoc> | undefined>;
  }>,
) => {
  return (
    <div class="min-w-0 flex flex-1 justify-center gap-5">
      <article class="mb-40 mt-4 min-w-0 flex shrink-1 basis-200 flex-col pl-5 text-slate-7 <lg:pl-4 <lg:pr-4">
        <div class="mb-6">
          <prose.h1 id="overview">{props.frontmatter.title}</prose.h1>
          <Show when={props.frontmatter.description}>
            <p class="my-4 text-[18px] text-gray font-400 leading-[28.8px]">
              {props.frontmatter.description}
            </p>
          </Show>
        </div>
        <MDXProvider components={prose}>{props.children}</MDXProvider>
      </article>
      <RightSidebar
        lang={props.params.lang}
        file={props.doc?.file ?? ""}
        headings={props.doc?.headings ?? []}
      />
    </div>
  );
};
