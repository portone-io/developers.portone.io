import {
  Collapsible,
  type CollapsibleContentProps,
  type CollapsibleRootProps,
  type CollapsibleTriggerProps,
} from "@kobalte/core/collapsible";
import { type PolymorphicProps } from "@kobalte/core/polymorphic";
import clsx from "clsx";
import { createSignal, onMount, splitProps, Suspense } from "solid-js";

export default function Details(
  props: PolymorphicProps<"div", CollapsibleRootProps<"div">>,
) {
  const [locals, others] = splitProps(props, ["class"]);
  const [open, setOpen] = createSignal(false);

  onMount(() => {
    const hash = window.location.hash;
    if (hash && hash.replace("#", "") === others.id) {
      setOpen(true);
      const el = document.querySelector(hash);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      window.scrollTo({ top: top - 100, behavior: "smooth" });
    }
  });

  return (
    <Collapsible
      {...others}
      open={open()}
      onOpenChange={setOpen}
      class={clsx(
        "group/details my-4 rounded-md border hover:border-orange [&[data-expanded]>button>.chevron]:origin-center [&[data-expanded]>button>.chevron]:rotate-90",
        locals.class,
      )}
    >
      {props.children}
    </Collapsible>
  );
}

Details.Summary = function DetailsSummary(
  props: PolymorphicProps<"div", CollapsibleTriggerProps<"div">>,
) {
  const [locals, others] = splitProps(props, ["class", "children"]);

  return (
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
