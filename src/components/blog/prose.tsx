import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";

export function h1(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <h1
      {...others}
      class={clsx(
        "text-1.875rem mt-12px mb-12px font-600 leading-[1.15] tracking-[-.021em] first:mt-0 last:mb-0",
        locals.class,
      )}
    >
      {locals.children}
    </h1>
  );
}

export function h2(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <h2
      {...others}
      class={clsx(
        "font-600 my-8 text-2xl leading-[1.7] tracking-[-.02em]",
        locals.class,
      )}
    >
      {locals.children}
    </h2>
  );
}

export function h3(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <h3
      {...others}
      class={clsx(
        "text-1.375rem font-600 my-8 leading-[1.7] tracking-[-.018em]",
        locals.class,
      )}
    >
      {locals.children}
    </h3>
  );
}

export function h4(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <h4
      {...others}
      class={clsx(
        "text-1.125rem font-600 my-3 leading-[1.7] tracking-[-.014em]",
        locals.class,
      )}
    >
      {locals.children}
    </h4>
  );
}

export function h5(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <h5
      {...others}
      class={clsx(
        "text-.875rem font-medium my-3 leading-[1.7] tracking-[-.006em]",
        locals.class,
      )}
    >
      {locals.children}
    </h5>
  );
}

export function h6(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <h6
      {...others}
      class={clsx(
        "text-.875rem font-medium my-3 leading-[1.7] tracking-[-.006em]",
        locals.class,
      )}
    >
      {locals.children}
    </h6>
  );
}

export function p(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <p {...others} class={clsx("my-5 leading-[1.7]", locals.class)}>
      {locals.children}
    </p>
  );
}

export function a(props: JSX.HTMLAttributes<HTMLAnchorElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <a
      {...others}
      class={clsx("cursor-pointer underline hover:text-slate-9", locals.class)}
    >
      {locals.children}
    </a>
  );
}

export function blockquote(props: JSX.HTMLAttributes<HTMLElement>) {
  const [locals, others] = splitProps(props, ["class", "children"]);
  return (
    <blockquote {...others} class={clsx("my-6 border-l-4 pl-4", locals.class)}>
      {locals.children}
    </blockquote>
  );
}
