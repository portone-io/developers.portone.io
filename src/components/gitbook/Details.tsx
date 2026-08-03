import {
  Collapsible,
  type CollapsibleContentProps,
  type CollapsibleRootProps,
  type CollapsibleTriggerProps,
} from "@kobalte/core/collapsible";
import { type PolymorphicProps } from "@kobalte/core/polymorphic";
import { writeClipboard } from "@solid-primitives/clipboard";
import { useLocation } from "@solidjs/router";
import clsx from "clsx";
import {
  createContext,
  createEffect,
  createSignal,
  on,
  Show,
  splitProps,
  Suspense,
  useContext,
} from "solid-js";

const DetailsIdContext = createContext<() => string | undefined>(
  () => undefined,
);

export default function Details(
  props: PolymorphicProps<"div", CollapsibleRootProps<"div">>,
) {
  const [locals, others] = splitProps(props, ["class"]);
  const [open, setOpen] = createSignal(false);
  const location = useLocation();

  createEffect(
    on(
      () => location.hash,
      (hash) => {
        if (!others.id || hash.replace("#", "") !== others.id) return;
        setOpen(true);
        const el = document.getElementById(others.id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    ),
  );

  return (
    <DetailsIdContext.Provider value={() => others.id}>
      <Collapsible
        {...others}
        open={open()}
        onOpenChange={setOpen}
        class={clsx(
          "group/details my-4 scroll-mt-[5.2rem] rounded-md border hover:border-orange [&[data-expanded]>div>button>.chevron]:origin-center [&[data-expanded]>div>button>.chevron]:rotate-90",
          locals.class,
        )}
      >
        {props.children}
      </Collapsible>
    </DetailsIdContext.Provider>
  );
}

Details.Summary = function DetailsSummary(
  props: PolymorphicProps<"div", CollapsibleTriggerProps<"div">>,
) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  const detailsId = useContext(DetailsIdContext);

  return (
    <div class="group/summary relative flex w-full items-center">
      <Collapsible.Trigger
        {...others}
        class={clsx(
          "flex w-full cursor-pointer items-center gap-3 border-l-4 border-l-transparent px-4 py-2",
          locals.class,
        )}
      >
        <div class="chevron h-5 w-5 transition-transform" role="img">
          <i class="icon-[ic--sharp-chevron-right] inline-block group-hover/details:text-orange"></i>
        </div>
        <div class="my-2">{locals.children}</div>
      </Collapsible.Trigger>
      <Show when={detailsId()}>
        {(id) => (
          <a
            href={`#${id()}`}
            title="링크 복사"
            aria-label="섹션 링크 복사"
            class="absolute right-4 opacity-0 transition-opacity group-hover/summary:opacity-100 focus-visible:opacity-100"
            onClick={() => {
              const url = new URL(window.location.href);
              url.hash = id();
              void writeClipboard(url.toString());
            }}
          >
            <i class="icon-[ic--baseline-link] inline-block h-5 w-5 align-middle hover:text-orange"></i>
          </a>
        )}
      </Show>
    </div>
  );
};

Details.Content = function DetailsContent(
  props: PolymorphicProps<"div", CollapsibleContentProps<"div">>,
) {
  const [locals, others] = splitProps(props, ["class", "children"]);

  return (
    <Collapsible.Content {...others} class={clsx(locals.class)}>
      <Suspense>
        <div class="-mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-l-4 border-l-transparent px-4 pb-2">
          <div class="h-5 w-5"></div>
          <div class="w-full">{props.children}</div>
        </div>
      </Suspense>
    </Collapsible.Content>
  );
};
