import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "preact/compat";

import { get } from "~/misc/get";

export function h1({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      class={clsx(
        "text-1.875rem mt-12px mb-12px font-600 leading-[1.15] tracking-[-.021em] first:mt-0 last:mb-0",
        get(props.class),
      )}
    >
      {children}
    </h1>
  );
}

export const h2 = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(function h2({ children, ...props }, ref) {
  return (
    <h2
      ref={ref}
      {...props}
      class={clsx(
        "font-600 my-8 text-2xl leading-[1.7] tracking-[-.02em]",
        get(props.class),
      )}
    >
      {children}
    </h2>
  );
});

export function h3({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      class={clsx(
        "text-1.375rem font-600 my-8 leading-[1.7] tracking-[-.018em]",
        get(props.class),
      )}
    >
      {children}
    </h3>
  );
}

export function h4({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      {...props}
      class={clsx(
        "text-1.125rem font-600 my-3 leading-[1.7] tracking-[-.014em]",
        get(props.class),
      )}
    >
      {children}
    </h4>
  );
}

export function h5({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      {...props}
      class={clsx(
        "text-.875rem font-500 my-3 leading-[1.7] tracking-[-.006em]",
        get(props.class),
      )}
    >
      {children}
    </h5>
  );
}

export function h6({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h6
      {...props}
      class={clsx(
        "text-.875rem font-500 my-3 leading-[1.7] tracking-[-.006em]",
        get(props.class),
      )}
    >
      {children}
    </h6>
  );
}

export function p({
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p {...props} class={clsx("my-5 leading-[1.7]", get(props.class))}>
      {children}
    </p>
  );
}

export function a({ children, ...props }: HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...props} class="cursor-pointer underline hover:text-slate-9">
      {children}
    </a>
  );
}

export function blockquote({
  children,
  ...props
}: HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote {...props} class="my-6 border-l-4 pl-4">
      {children}
    </blockquote>
  );
}
